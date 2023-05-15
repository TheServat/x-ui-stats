import { BadRequestException, Injectable } from '@nestjs/common';
import Axios from 'axios-observable';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { concatMap, map, catchError } from 'rxjs';
import { ISetting, ListResponse } from './types';
@Injectable()
export class AppService {
  async getInfo(config: string) {
    const accountConfig = this.encodeConfig(config);
    const server = await this.findServer(accountConfig.domain);
    const instance = Axios.create({
      withCredentials: true,
      baseURL: `http://${server.domain}:${server.port}`,
    });
    return instance
      .post('/login', { username: server.username, password: server.password })
      .pipe(
        concatMap((response) => {
          const cookie = response.headers['set-cookie'];
          return instance.post<ListResponse>(
            '/panel/inbound/list',
            {},
            {
              headers: { Cookie: cookie[0] },
            },
          );
        }),
      )
      .pipe(
        catchError((error) => {
          console.error(error);
          throw error;
        }),
        map((response) => {
          const inbound = response.data.obj.find(
            (a) => +a.port === +accountConfig.port,
          );
          if (!inbound) {
            throw new BadRequestException('اطلاعات وارد شده یافت نشد');
          }
          const settings = JSON.parse(inbound.settings) as ISetting;
          const client = settings.clients.find(
            (s) => s.id === accountConfig.uuid,
          );
          if (!client) {
            throw new BadRequestException('اطلاعات وارد شده یافت نشد');
          }
          let down = inbound.down;
          let up = inbound.up;
          const clientStat = inbound.clientStats.find(
            (s) => s.email === client.email,
          );
          if (clientStat) {
            down = clientStat.down;
            up = clientStat.up;
          }
          return {
            ...client,
            id: inbound.remark + '-' + client.email,
            enable: inbound.enable === false ? false : client.enable,
            expiryTime: client.expiryTime
              ? client.expiryTime
              : inbound.expiryTime,
            limitIp: inbound.listen || client.limitIp,
            totalGB: client.totalGB || inbound.total,
            down,
            up,
          };
        }),
      );
  }
  private encodeConfig(config: string) {
    if (config.startsWith('vless://')) {
      const url = new URL(config.replace('vless://', 'http://'));
      return { domain: url.hostname, port: +url.port, uuid: url.username };
    }
    if (config.startsWith('vmess://')) {
      const json = JSON.parse(
        Buffer.from(config.replace('vmess://', ''), 'base64').toString('utf-8'),
      ) as {
        v: string; //"2",
        ps: string; //"Toomar",
        add: string; //"as.oly.ir",
        port: string; // 28298,
        id: string; //"91bc0356-afdc-4411-d357-2153e9c07234",
        aid: number; //0,
        net: string; //"tcp",
        type: string; //"http",
        host: string; //"",
        path: string; //"/",
        tls: string; //"none"
      };
      return { domain: json.add, port: +json.port, uuid: json.id };
    }
    throw new BadRequestException('اطلاعات وارد شده یافت نشد');
  }

  private async findServer(domain: string) {
    try {
      const servers = JSON.parse(
        (await readFile(join(__dirname, '../../servers.json'))).toString(
          'utf-8',
        ),
      ) as {
        domain: string;
        port: number;
        username: string;
        password: string;
      }[];
      const s = servers.find((s) => s.domain === domain);
      if (!s) {
        throw new BadRequestException('اطلاعات وارد شده یافت نشد');
      }
      return s;
    } catch (error) {
      throw new BadRequestException('اطلاعات وارد شده یافت نشد');
    }
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import Axios from 'axios-observable';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { concatMap, map, catchError } from 'rxjs';
import { ListResponse } from './types';
@Injectable()
export class AppService {
  async getInfo(config: string) {
    const accountConfig = this.getDomainPort(config);
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
          console.log(cookie);
          return instance.post<ListResponse>('/xui/inbound/list', undefined, {
            headers: { Cookie: cookie[0] },
          });
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
          return inbound;
        }),
      );
  }
  private getDomainPort(config: string) {
    if (config.startsWith('vless://')) {
      const url = new URL(config.replace('vless://', 'http://'));
      return { domain: url.hostname, port: +url.port };
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
      return { domain: json.add, port: +json.port };
    }
    throw new BadRequestException('اطلاعات وارد شده یافت نشد');
  }

  private async findServer(domain: string) {
    try {
      const servers = JSON.parse(
        (await readFile(join(__dirname, '../servers.json'))).toString('utf-8'),
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

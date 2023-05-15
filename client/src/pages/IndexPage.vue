<template>
  <q-page class="row content-center justify-evenly q-pa-sm q-col-gutter-xl">
    <div class="col-12 col-md-10">
      <q-form ref="form" @submit="onSubmit" class="q-gutter-md">
        <q-input v-model.trim="config" @keyup.enter="onSubmit" rounded dark type="text" autogrow outlined bg-color="dark"
          placeholder="vless://... || vmess://..."
          :rules="[val => val && (val.startsWith('vless://') || val.startsWith('vmess://'))]" lazy-rules />
        <div class="text-center">
          <q-btn label="Get Info" type="submit" color="dark" rounded />
        </div>
      </q-form>
    </div>
    <div class="col-12 col-md-8">
      <transition appear enter-active-class="animated zoomInUp">
        <q-list v-if="data" bordered class="bg-white">
          <q-item clickable v-ripple class="text-center">
            <q-item-section>
              {{ data.id }}
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple class="text-center">
            <q-item-section>
              <q-linear-progress size="25px" :value="progress.progress" color="accent">
                <div class="absolute-full flex flex-center">
                  <q-badge color="white" text-color="accent" :label="progress.label" />
                </div>
              </q-linear-progress>
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple>
            <q-item-section>
              Enable
            </q-item-section>
            <q-item-section>
              <q-toggle v-model="data.enable" disable color="green" :label="data.enable ? 'YES' : 'NO'" />

            </q-item-section>
          </q-item>
          <q-item clickable v-ripple>
            <q-item-section>
              Expire At
            </q-item-section>
            <q-item-section>
              <q-badge color="white" text-color="accent" :label="getDate(data.expiryTime)" />
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple>
            <q-item-section>
              Total:
            </q-item-section>
            <q-item-section>
              <q-badge color="white" text-color="accent" :label="formatByte(data.total)" />
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple>
            <q-item-section>
              Used Download:
            </q-item-section>
            <q-item-section>
              <q-badge color="white" text-color="accent" :label="formatByte(data.down)" />
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple>
            <q-item-section>
              Used Upload:
            </q-item-section>
            <q-item-section>
              <q-badge color="white" text-color="accent" :label="formatByte(data.up)" />
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple>
            <q-item-section>
              Used Total:
            </q-item-section>
            <q-item-section>
              <q-badge color="white" text-color="accent" :label="formatByte(data.down + data.up)" />
            </q-item-section>
          </q-item>
          <q-item v-if="data.total > 0" clickable v-ripple>
            <q-item-section>
              Available:
            </q-item-section>
            <q-item-section>
              {{ formatByte(data.total - data.down - data.up) }}
            </q-item-section>
          </q-item>
        </q-list>
      </transition>
    </div>
    <q-inner-loading :showing="loading" dark>
      <q-spinner-ball size="50px" color="primary" />
    </q-inner-loading>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { DateTime } from 'luxon'
import { format } from 'bytes'
import { api } from 'src/boot/axios';
import { Notify, QForm } from 'quasar';

const form = ref<QForm>()
const loading = ref(false)
const config = ref('')
const data = ref<{

  'id': string,
  'flow': string,
  'email': string,
  'limitIp': number,
  'totalGB': number,
  'expiryTime': number,
  'enable': boolean,
  'tgId': string,
  'subId': string,
  'inboundId': number,
  'up': number,
  'down': number,
  'total': number
}>()
const getDate = (t?: number) => {
  if (t && t > 0) {
    return DateTime.fromMillis(t).toLocaleString(DateTime.DATETIME_FULL)
  }
  return '∞'
}
const formatByte = (b?: number) => {
  if (b && b > 0) {
    return format(b)
  }
  return '∞'
}
const progress = computed(() => {
  if (!data.value) {
    return {
      label: 0,
      progress: 0
    }
  }
  if (!data.value.total) {
    return {
      progress: 0,
      label: '∞'
    }
  }
  const p = ((data.value.up + data.value.down) / data.value.total).toFixed(2)
  return {
    label: `${p}%`,
    progress: +p
  }
})
const onSubmit = async () => {
  if (!form.value || !form.value?.validate(true)) {
    return;
  }
  loading.value = true
  try {
    const response = await api.post('/api', { config: config.value })
    data.value = response.data
  } catch (error) {
    Notify.create({ type: 'negative', message: 'Error!' })
  }
  loading.value = false;
}
</script>

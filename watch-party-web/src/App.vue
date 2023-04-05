<template>
  <v-app>
    <v-flex v-if="!room.state"
            grow
            align-center
            justify-center>
      <v-card class="pa-3">
        <v-text-field solo
                      class="mt-0"
                      v-model="urlInput"
                      @keydown="onKeyDown" />
      </v-card>
    </v-flex>
    <Video v-else
           :room="room" />
  </v-app>
</template>

<script setup lang="ts">
import { reactive, shallowRef, watch } from 'vue';
import { Room } from './socket';
import Video from './Video.vue';

const url = new URL(location.href);
const room_name = url.searchParams.get('room');

let room: Room;
if (room_name) {
  room = Room.join(room_name);
} else {
  room = Room.create();
}

const urlInput = shallowRef('');

watch(() => room.name, name => {
  if (name) {
    const url = new URL(location.href);
    url.searchParams.set('room', name);
    window.history.pushState(null, '', url);
  }
});

function onKeyDown(e: KeyboardEvent) {
  if (e.key == 'Enter') {
    room.init(urlInput.value);
  }
}
</script>

<style lang="scss">
#app {
  height: 100vh;
}
</style>

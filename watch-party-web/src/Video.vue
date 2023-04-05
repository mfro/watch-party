<template>
  <div class="container">
    <video ref="video"
           controls
           @play="onPlay"
           @pause="onPause"
           @seeked="onSeek" />

    <!-- <div class="buttons">
      <v-button class="ma-2" icon @click="play">
        <v-icon large v-if="state.playing">pause</v-icon>
        <v-icon large v-else>play_arrow</v-icon>
      </v-button>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { shallowRef, watch, watchEffect } from 'vue';
import { Room } from './socket';

const props = defineProps<{
  room: Room,
}>();

const video = shallowRef<HTMLVideoElement>();

watchEffect(() => {
  if (video.value && typeof props.room.state?.url == 'string') {
    console.log(props.room.state.url);
    video.value.src = props.room.state.url;
  }
});

watchEffect(() => {
  if (video.value && typeof props.room.state?.play == 'boolean') {
    console.log(props.room.state.play);
    if (props.room.state.play) {
      video.value!.play();
    } else {
      video.value!.pause();
    }
  }
});

watchEffect(() => {
  if (video.value && typeof props.room.state?.time == 'number') {
    console.log(props.room.state.time);
    video.value!.currentTime = props.room.state.time;
  }
});

function onPlay(e: Event) {
  if (!props.room.state?.play)
    props.room.play(true);
}

function onPause(e: Event) {
  if (props.room.state?.play)
    props.room.play(false);
}

function onSeek() {
  if (props.room.state?.time != video.value?.currentTime)
    props.room.time(video.value!.currentTime);
}
</script>

<style scoped lang="scss">
.container {
  position: relative;
  display: flex;

  > video {
    width: 100vw;
    height: 100vh;
  }
}
</style>

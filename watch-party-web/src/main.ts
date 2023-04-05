import { createApp } from 'vue';
import { framework } from '@mfro/vue-ui';

import App from './App.vue';
import 'ress';

const app = createApp(App);
app.use(framework);
app.mount('#app');

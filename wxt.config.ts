import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'LinkedIn Notes',
    description: 'Private notes & tags for LinkedIn profiles',
    version: '1.0.0',
    permissions: ['storage'],
    icons: {
      '16': 'icon/16.png',
      '32': 'icon/32.png',
      '48': 'icon/48.png',
      '96': 'icon/96.png',
      '128': 'icon/128.png',
    },
  },
});

import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'LinkedIn Notes',
    description: 'Private notes & tags for LinkedIn profiles',
    version: '1.0.4',
    permissions: ['storage'],
    icons: {
      '16': 'icon/16.png',
      '32': 'icon/32.png',
      '48': 'icon/48.png',
      '96': 'icon/96.png',
      '128': 'icon/128.png',
    },
    // Toolbar / extensions-menu icon (separate from `icons`, which is only the
    // store/management-page icon). Without this Chrome shows the puzzle piece.
    action: {
      default_icon: {
        '16': 'icon/16.png',
        '32': 'icon/32.png',
        '48': 'icon/48.png',
        '128': 'icon/128.png',
      },
    },
  },
});

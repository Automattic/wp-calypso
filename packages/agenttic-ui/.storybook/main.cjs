const { mergeConfig } = require('vite');
const path = require('path');

const config = {
  stories: [
    '../src/**/*.stories.@(js|jsx|ts|tsx)',
    '../src/**/*.mdx'
  ],
  addons: [
    {
      name: '@storybook/addon-essentials',
      options: {
        docs: false, // Disable docs in essentials to avoid conflict
      },
    },
    '@storybook/addon-a11y',
    {
      name: '@storybook/addon-docs',
      options: {
        configureJSX: true,
        mdxPluginOptions: {},
      },
    },
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {},
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      css: {
        modules: {
          localsConvention: 'camelCaseOnly',
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
      },
      resolve: {
        alias: {
          // No aliases needed currently
        },
      },
      optimizeDeps: {
        include: [
          'react',
          'react-dom',
          'react/jsx-dev-runtime',
          '@mdx-js/react',
          '@storybook/blocks',
        ],
        exclude: [
        ],
      },
      define: {
        global: 'globalThis',
      },
    });
  },
};

module.exports = config;

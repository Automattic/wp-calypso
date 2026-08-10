import type { Preview } from '@storybook/react';
import React from 'react';
import '../src/styles/tokens.css';
import '../src/styles/global.css';
import '../src/markdown-extensions/charts/charts.css';
import './preview.css';
import './mocks/wordpress';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'fullscreen',
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: { width: '375px', height: '667px' },
        },
        tablet: {
          name: 'Tablet',
          styles: { width: '768px', height: '1024px' },
        },
        desktop: {
          name: 'Desktop',
          styles: { width: '1440px', height: '900px' },
        },
      },
    },
    options: {
      storySort: {
        order: ['Docs', '*'],
        method: 'alphabetical',
      },
    },
  },
  globalTypes: {
    theme: {
      description: 'Agenttic color theme',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'contrast',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story: any, context: any) => {
      const isDark = context.globals.theme === 'dark';
      return React.createElement(
        'div',
        {
          // Tokens flip under `.agenttic.dark`; paint the surface so the
          // dark background is actually visible behind the story.
          className: isDark ? 'agenttic dark' : 'agenttic',
          style: {
            background: 'var(--color-background)',
            color: 'var(--color-foreground)',
            minHeight: '100vh',
          },
        },
        React.createElement(Story)
      );
    },
  ],
};

export default preview;

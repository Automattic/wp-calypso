import { Meta, StoryObj } from '@storybook/react';
import { JetpackLogo } from '../logos/jetpack-logo';
import { WooLogo } from '../logos/woo-logo';
import WordPressWordmark from '../wordpress-wordmark';
import { PoweredBy } from './';

// TODO:
// - unify Woo logos
// - unify WordPress.com logos
// - refactor each logo:
//   - unify logos to accept same props (width, height, variant, monochrome, theme)
//   - normalize the visual "weight" and alignment given the same size
//   - forward ref
//   - add accessible text

const meta: Meta< typeof PoweredBy > = {
	title: 'Powered By',
	component: PoweredBy,
	tags: [ 'autodocs' ],
	parameters: {
		actions: { argTypesRegex: '^on.*' },
	},
	argTypes: {
		renderLogo: {
			control: 'select',
			options: [ 'Jetpack (brand colors)', 'Jetpack (monochrome)', 'WordPress.com', 'WooCommerce' ],
			mapping: {
				'Jetpack (brand colors)': <JetpackLogo />,
				'Jetpack (monochrome)': <JetpackLogo monochrome />,
				'WordPress.com': <WordPressWordmark color="#000" />,
				WooCommerce: <WooLogo />,
			},
		},
	},
};

export default meta;
type Story = StoryObj< typeof PoweredBy >;

export const Default: Story = {};

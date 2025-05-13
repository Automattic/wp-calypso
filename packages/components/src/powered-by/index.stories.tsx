import { Meta, StoryObj } from '@storybook/react';
// import WordPressWordmark from '../wordpress-wordmark';
import { JetpackLogo } from './temp-logos/jetpack';
import { WooLogo } from './temp-logos/woo';
import { WordPressComLogo } from './temp-logos/wordpresscom';
import { PoweredBy } from './';

// TODO:
// - unify Woo / Jetpack / WordPress.com logo instances
// - verify all combination of variants / themes / monochrome
// - normalize the visual "weight" and alignment given the same size
// - confirm hardcoded colors vs currentColor

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
			options: [
				'Jetpack (full variant, brand colors, light scheme)',
				'Jetpack (full variant, monochrome, light scheme)',
				'Jetpack (full variant, brand colors, dark scheme)',
				'Jetpack (full variant, monochrome, dark scheme)',
				'WooCommerce (woo variant, brand colors, light scheme)',
				'WooCommerce (woo variant, monochrome, light scheme)',
				'WooCommerce (woo variant, brand colors, dark scheme)',
				'WooCommerce (woo variant, monochrome, dark scheme)',
				'WordPress.com (full variant, brand colors, light scheme)',
				'WordPress.com (full variant, monochrome, light scheme)',
				'WordPress.com (full variant, brand colors, dark scheme)',
				'WordPress.com (full variant, monochrome, dark scheme)',
			],
			mapping: {
				'Jetpack (full variant, brand colors, light scheme)': <JetpackLogo />,
				'Jetpack (full variant, monochrome, light scheme)': <JetpackLogo monochrome />,
				'Jetpack (full variant, brand colors, dark scheme)': <JetpackLogo theme="dark" />,
				'Jetpack (full variant, monochrome, dark scheme)': <JetpackLogo monochrome theme="dark" />,
				'WooCommerce (woo variant, brand colors, light scheme)': <WooLogo />,
				'WooCommerce (woo variant, monochrome, light scheme)': <WooLogo monochrome />,
				'WooCommerce (woo variant, brand colors, dark scheme)': <WooLogo theme="dark" />,
				'WooCommerce (woo variant, monochrome, dark scheme)': <WooLogo monochrome theme="dark" />,
				'WordPress.com (full variant, brand colors, light scheme)': <WordPressComLogo />,
				'WordPress.com (full variant, monochrome, light scheme)': <WordPressComLogo monochrome />,
				'WordPress.com (full variant, brand colors, dark scheme)': (
					<WordPressComLogo theme="dark" />
				),
				'WordPress.com (full variant, monochrome, dark scheme)': (
					<WordPressComLogo monochrome theme="dark" />
				),
			},
		},
	},
	decorators: [
		( Story, context ) => {
			const isLogoDarkTheme = context.args.renderLogo?.props.theme === 'dark';
			const backgroundColor = isLogoDarkTheme ? '#000' : '#fff';
			const color = isLogoDarkTheme ? '#fff' : '#000';

			return (
				<div
					style={ {
						minHeight: '6rem',
						padding: '1rem',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						backgroundColor,
						color,
					} }
				>
					<Story />
				</div>
			);
		},
	],
};

export default meta;
type Story = StoryObj< typeof PoweredBy >;

export const Default: Story = {
	args: {
		renderLogo: <WordPressComLogo />,
	},
};

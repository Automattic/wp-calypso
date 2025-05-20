/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */
import { wordpress } from '@wordpress/icons';
import { SVG, Path } from '@wordpress/primitives';

/**
 * Internal dependencies
 */
import Icon from '..';
import { VStack } from '../../v-stack';
import type { Meta, StoryFn } from '@storybook/react';

const meta: Meta< typeof Icon > = {
	title: 'Components/Icon',
	component: Icon,
	parameters: {
		controls: { expanded: true },
		docs: { canvas: { sourceState: 'shown' } },
	},
};
export default meta;

const Template: StoryFn< typeof Icon > = ( args ) => <Icon { ...args } />;

export const Default = Template.bind( {} );
Default.args = {
	icon: wordpress,
};

export const FillColor: StoryFn< typeof Icon > = ( args ) => {
	return (
		<div
			style={ {
				fill: 'blue',
			} }
		>
			<Icon { ...args } />
		</div>
	);
};
FillColor.args = {
	...Default.args,
};

/**
 * When `icon` is a function, it will be passed the `size` prop and any other additional props.
 */
export const WithAFunction = Template.bind( {} );
WithAFunction.args = {
	...Default.args,
	icon: ( { size }: { size?: number } ) => (
		<img
			width={ size }
			height={ size }
			src="https://s.w.org/style/images/about/WordPress-logotype-wmark.png"
			alt="WordPress"
		/>
	),
};
WithAFunction.parameters = {
	docs: {
		source: {
			code: `
<Icon
  icon={ ( { size } ) => (
    <img
      width={ size }
      height={ size }
      src="https://s.w.org/style/images/about/WordPress-logotype-wmark.png"
      alt="WordPress"
    />
  ) }
/>
		`,
		},
	},
};

const MyIconComponent = ( { size }: { size?: number } ) => (
	<SVG width={ size } height={ size }>
		<Path d="M5 4v3h5.5v12h3V7H19V4z" />
	</SVG>
);

/**
 * When `icon` is a component, it will be passed the `size` prop and any other additional props.
 */
export const WithAComponent = Template.bind( {} );
WithAComponent.args = {
	...Default.args,
	icon: <MyIconComponent />,
};
WithAComponent.parameters = {
	docs: {
		source: {
			code: `
const MyIconComponent = ( { size } ) => (
  <SVG width={ size } height={ size }>
    <Path d="M5 4v3h5.5v12h3V7H19V4z" />
  </SVG>
);

<Icon icon={ <MyIconComponent /> } />
		`,
		},
	},
};

export const WithAnSVG = Template.bind( {} );
WithAnSVG.args = {
	...Default.args,
	icon: (
		<SVG>
			<Path d="M5 4v3h5.5v12h3V7H19V4z" />
		</SVG>
	),
};

/**
 * Although it's preferred to use icons from the `@wordpress/icons` package, [Dashicons](https://developer.wordpress.org/resource/dashicons/) are still supported,
 * as long as you are in a context where the Dashicons stylesheet is loaded. To simulate that here,
 * use the Global CSS Injector in the Storybook toolbar at the top and select the "WordPress" preset.
 */
export const WithADashicon: StoryFn< typeof Icon > = ( args ) => {
	return (
		<VStack>
			<Icon { ...args } />
			<small>This won’t show an icon if the Dashicons stylesheet isn’t loaded.</small>
		</VStack>
	);
};
WithADashicon.args = {
	...Default.args,
	icon: 'wordpress',
};

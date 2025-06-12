import { wordpress } from '@wordpress/icons';
import { SVG, Path } from '@wordpress/primitives';
import { Icon } from '.';
import type { Meta, StoryFn } from '@storybook/react';

const meta: Meta< typeof Icon > = {
	title: 'Unpublished/Icon',
	component: Icon,
	parameters: {
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

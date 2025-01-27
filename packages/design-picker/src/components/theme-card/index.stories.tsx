import { StoryFn, Meta } from '@storybook/react';
import { ComponentProps } from 'react';
import ThemeCard from './index';

export default {
	title: 'packages/design-picker/ThemeCard',
	component: ThemeCard,
	parameters: {
		viewport: {
			defaultViewport: 'SMALL',
		},
	},
} as Meta;

type ThemeCardStory = StoryFn< ComponentProps< typeof ThemeCard > >;
const Template: ThemeCardStory = ( args ) => <ThemeCard { ...args } />;

const Image = () => (
	<img
		alt="Stewart is a modern blogging theme with a left sidebar. Its default color scheme is a striking combination of orange and light gray, to give your blog a sophisticated appearance from day one."
		src="https://i0.wp.com/s2.wp.com/wp-content/themes/pub/stewart/screenshot.png"
	></img>
);
const defaultArgs = {
	name: 'Stewart',
	image: <Image></Image>,
};

export const NotActive: ThemeCardStory = Template.bind( {} );
NotActive.args = {
	...defaultArgs,
};

export const Active: ThemeCardStory = Template.bind( {} );
Active.args = {
	...defaultArgs,
	isActive: true,
};

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
	isShowDescriptionOnImageHover: true,
	description:
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
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

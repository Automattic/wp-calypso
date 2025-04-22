import type { StoryFn } from '@storybook/react';
import './style.scss';

export const LoginForm = ( Story: StoryFn ) => (
	<div className="login__form-action" style={ { maxWidth: '300px', padding: '30px' } }>
		<Story />
	</div>
);

export const WooWrapper = ( Story: StoryFn ) => (
	<div className="woo is-woo-passwordless is-woo-com-oauth">
		<Story />
	</div>
);

import type { StoryFn } from '@storybook/react';
import './style.scss';

export const AuthFormSocial = ( Story: StoryFn ) => (
	<div className="auth-form__social" style={ { maxWidth: '300px', padding: '30px' } }>
		<div className="auth-form__social-buttons">
			<div className="auth-form__social-buttons-container">
				<Story />
			</div>
		</div>
	</div>
);

export const A4AWrapper = ( Story: StoryFn ) => (
	<div className="a8c-for-agencies">
		<Story />
	</div>
);

export const AkismetWrapper = ( Story: StoryFn ) => (
	<div className="is-akismet">
		<Story />
	</div>
);

export const BlazeWrapper = ( Story: StoryFn ) => (
	<div className="blaze-pro">
		<Story />
	</div>
);

export const WooWrapper = ( Story: StoryFn ) => (
	<div className="woo is-woo-passwordless">
		<Story />
	</div>
);

export const JetpackWrapper = ( Story: StoryFn ) => (
	<div className="jetpack-cloud">
		<Story />
	</div>
);

export const GravatarWrapper = ( Story: StoryFn ) => (
	<div className="layout is-section-login is-grav-powered-client">
		<div className="login">
			<Story />
		</div>
	</div>
);

export const WPJobManagerWrapper = ( Story: StoryFn ) => (
	<div className="layout is-section-login is-grav-powered-client is-wp-job-manager">
		<div className="login">
			<Story />
		</div>
	</div>
);

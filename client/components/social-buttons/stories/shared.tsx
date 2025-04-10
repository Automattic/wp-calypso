import type { StoryFn } from '@storybook/react';
import './style.scss';

export const SocialButtonWrapper = ( Story: StoryFn ) => (
	<div className="auth-form__social" style={ { padding: '30px', maxWidth: '300px' } }>
		<div className="auth-form__social-buttons">
			<div className="auth-form__social-buttons-container">
				<Story />
			</div>
		</div>
	</div>
);

export const WooWrapper = ( Story: StoryFn ) => (
	<div className="woo is-woo-passwordless" style={ { paddingInline: '30px' } }>
		<div className="auth-form__social" style={ { maxWidth: '300px' } }>
			<div className="auth-form__social-buttons">
				<div className="auth-form__social-buttons-container">
					<Story />
				</div>
			</div>
		</div>
	</div>
);

export const GravatarWrapper = ( Story: StoryFn ) => (
	<div className="layout is-section-login is-grav-powered-client" style={ { padding: '30px' } }>
		<div className="auth-form__social" style={ { maxWidth: '300px' } }>
			<div className="auth-form__social-buttons">
				<div className="auth-form__social-buttons-container">
					<Story />
				</div>
			</div>
		</div>
	</div>
);

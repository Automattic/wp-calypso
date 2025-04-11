import type { StoryFn } from '@storybook/react';
import './style.scss';

export const AkismetWrapper = ( Story: StoryFn ) => (
	<div className="is-akismet" style={ { padding: '30px' } }>
		<div className="auth-form__social" style={ { maxWidth: '300px' } }>
			<div className="auth-form__social-buttons">
				<div className="auth-form__social-buttons-container">
					<Story />
				</div>
			</div>
		</div>
	</div>
);

export const BlazeWrapper = ( Story: StoryFn ) => (
	<div className="blaze-pro" style={ { padding: '30px' } }>
		<div className="auth-form__social" style={ { maxWidth: '300px' } }>
			<div className="auth-form__social-buttons">
				<div className="auth-form__social-buttons-container">
					<Story />
				</div>
			</div>
		</div>
	</div>
);

export const DefaultWrapper = ( Story: StoryFn ) => (
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

export const JetpackWrapper = ( Story: StoryFn ) => (
	<div className="jetpack-cloud" style={ { paddingInline: '30px' } }>
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
		<div className="login">
			<div className="auth-form__social" style={ { maxWidth: '300px' } }>
				<div className="auth-form__social-buttons">
					<div className="auth-form__social-buttons-container">
						<Story />
					</div>
				</div>
			</div>
		</div>
	</div>
);

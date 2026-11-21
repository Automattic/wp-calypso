import { captureMessage } from '@automattic/calypso-sentry';

const stepNameToModuleName = {
	domains: 'domains',
	'domain-only': 'domains',
	'hosting-decider': 'hosting-decider',
	'domains-theme-preselected': 'domains',
	'mailbox-domain': 'domains',
	mailbox: 'emails',
	'mailbox-plan': 'plans',
	plans: 'plans',
	'plans-with-plugin': 'plans',
	'plans-site-selected': 'plans',
	'plans-site-selected-legacy': 'plans',
	'plans-affiliate': 'plans',
	'rewind-were-backing': 'rewind-were-backing',
	'rewind-form-creds': 'rewind-form-creds',
	'site-or-domain': 'site-or-domain',
	'site-picker': 'site-picker',
	user: 'user',
	'oauth2-user': 'user',
	'oauth2-name': 'user',
	'user-social': 'user',
	'plans-theme-preselected': 'plans-theme-preselected',
	'new-or-existing-site': 'new-or-existing-site',
	'difm-site-picker': 'difm-site-picker',
	'difm-design-setup-site': 'design-picker',
	'difm-options': 'site-options',
	'difm-store-options': 'site-options',
	'difm-page-picker': 'page-picker',
	'website-content': 'website-content',
	'social-profiles': 'social-profiles',
};

const stepModuleLoaders = {
	'design-picker': () =>
		import(
			/* webpackChunkName: "async-load-signup-steps-design-picker" */
			'calypso/signup/steps/design-picker'
		),
	'difm-site-picker': () =>
		import(
			/* webpackChunkName: "async-load-signup-steps-difm-site-picker" */
			'calypso/signup/steps/difm-site-picker'
		),
	domains: () =>
		import(
			/* webpackChunkName: "async-load-signup-steps-domains" */
			'calypso/signup/steps/domains'
		),
	emails: () =>
		import(
			/* webpackChunkName: "async-load-signup-steps-emails" */
			'calypso/signup/steps/emails'
		),
	'hosting-decider': () =>
		import(
			/* webpackChunkName: "async-load-signup-steps-hosting-decider" */
			'calypso/signup/steps/hosting-decider'
		),
	'new-or-existing-site': () =>
		import(
			/* webpackChunkName: "async-load-signup-steps-new-or-existing-site" */
			'calypso/signup/steps/new-or-existing-site'
		),
	'page-picker': () =>
		import(
			/* webpackChunkName: "async-load-signup-steps-page-picker" */
			'calypso/signup/steps/page-picker'
		),
	plans: () =>
		import(
			/* webpackChunkName: "async-load-signup-steps-plans" */
			'calypso/signup/steps/plans'
		),
	'plans-theme-preselected': () =>
		import(
			/* webpackChunkName: "async-load-signup-steps-plans-theme-preselected" */
			'calypso/signup/steps/plans-theme-preselected'
		),
	'rewind-form-creds': () =>
		import(
			/* webpackChunkName: "async-load-signup-steps-rewind-form-creds" */
			'calypso/signup/steps/rewind-form-creds'
		),
	'rewind-were-backing': () =>
		import(
			/* webpackChunkName: "async-load-signup-steps-rewind-were-backing" */
			'calypso/signup/steps/rewind-were-backing'
		),
	'site-options': () =>
		import(
			/* webpackChunkName: "async-load-signup-steps-site-options" */
			'calypso/signup/steps/site-options'
		),
	'site-or-domain': () =>
		import(
			/* webpackChunkName: "async-load-signup-steps-site-or-domain" */
			'calypso/signup/steps/site-or-domain'
		),
	'site-picker': () =>
		import(
			/* webpackChunkName: "async-load-signup-steps-site-picker" */
			'calypso/signup/steps/site-picker'
		),
	'social-profiles': () =>
		import(
			/* webpackChunkName: "async-load-signup-steps-social-profiles" */
			'calypso/signup/steps/social-profiles'
		),
	user: () =>
		import(
			/* webpackChunkName: "async-load-signup-steps-user" */
			'calypso/signup/steps/user'
		),
	'website-content': () =>
		import(
			/* webpackChunkName: "async-load-signup-steps-website-content" */
			'calypso/signup/steps/website-content'
		),
};

export function getStepModuleName( stepName ) {
	return stepNameToModuleName[ stepName ] || '';
}
export function getStepModuleMap() {
	return stepNameToModuleName;
}
export function getStepModuleLoaders() {
	return stepModuleLoaders;
}
export async function getStepComponent( stepName ) {
	const moduleName = stepNameToModuleName[ stepName ];
	if ( ! moduleName ) {
		// eslint-disable-next-line no-console
		console.error( 'Error: unknown `stepName` to retrieve the component for.' );
		return;
	}
	const loadStepModule = stepModuleLoaders[ moduleName ];
	if ( ! loadStepModule ) {
		const message = `Signup: no loader for step module \`${ moduleName }\`.`;
		if ( process.env.NODE_ENV !== 'production' ) {
			// eslint-disable-next-line no-console
			console.error( message );
		}
		captureMessage( message, { level: 'error', tags: { stepName, moduleName } } );
		return;
	}
	const module = await loadStepModule();
	return module.default;
}

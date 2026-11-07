const stepNameToModuleName = {
	'creds-confirm': 'creds-confirm',
	'creds-permission': 'creds-permission',
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

// PROTOTYPE (DOTMSD-1679): explicit loaders in place of a template-literal import(), which
// Vite leaves untransformed.
const stepModuleLoaders = {
	'creds-confirm': () => import( 'calypso/signup/steps/creds-confirm' ),
	'creds-permission': () => import( 'calypso/signup/steps/creds-permission' ),
	'design-picker': () => import( 'calypso/signup/steps/design-picker' ),
	'difm-site-picker': () => import( 'calypso/signup/steps/difm-site-picker' ),
	domains: () => import( 'calypso/signup/steps/domains' ),
	emails: () => import( 'calypso/signup/steps/emails' ),
	'hosting-decider': () => import( 'calypso/signup/steps/hosting-decider' ),
	'new-or-existing-site': () => import( 'calypso/signup/steps/new-or-existing-site' ),
	'page-picker': () => import( 'calypso/signup/steps/page-picker' ),
	plans: () => import( 'calypso/signup/steps/plans' ),
	'plans-theme-preselected': () => import( 'calypso/signup/steps/plans-theme-preselected' ),
	'rewind-form-creds': () => import( 'calypso/signup/steps/rewind-form-creds' ),
	'rewind-were-backing': () => import( 'calypso/signup/steps/rewind-were-backing' ),
	'site-options': () => import( 'calypso/signup/steps/site-options' ),
	'site-or-domain': () => import( 'calypso/signup/steps/site-or-domain' ),
	'site-picker': () => import( 'calypso/signup/steps/site-picker' ),
	'social-profiles': () => import( 'calypso/signup/steps/social-profiles' ),
	user: () => import( 'calypso/signup/steps/user' ),
	'website-content': () => import( 'calypso/signup/steps/website-content' ),
};

export function getStepModuleName( stepName ) {
	return stepNameToModuleName[ stepName ] || '';
}
export function getStepModuleMap() {
	return stepNameToModuleName;
}
export async function getStepComponent( stepName ) {
	const moduleName = stepNameToModuleName[ stepName ];
	if ( ! moduleName ) {
		// eslint-disable-next-line no-console
		console.error( 'Error: unknown `stepName` to retrieve the component for.' );
		return;
	}
	const module = await stepModuleLoaders[ moduleName ]();
	return module.default;
}

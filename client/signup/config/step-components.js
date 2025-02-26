const stepNameToModuleName = {
	'clone-start': 'clone-start',
	'clone-destination': 'clone-destination',
	'clone-credentials': 'clone-credentials',
	'clone-point': 'clone-point',
	'clone-ready': 'clone-ready',
	'clone-cloning': 'clone-cloning',
	courses: 'courses',
	'creds-confirm': 'creds-confirm',
	'creds-permission': 'creds-permission',
	domains: 'domains',
	'domain-only': 'domains',
	'domains-launch': 'domains',
	'hosting-decider': 'hosting-decider',
	'domains-theme-preselected': 'domains',
	'mailbox-domain': 'domains',
	mailbox: 'emails',
	launch: 'launch-site',
	'mailbox-plan': 'plans',
	plans: 'plans',
	'plans-new': 'plans',
	'plans-business': 'plans',
	'plans-business-with-plugin': 'plans',
	'plans-import': 'plans',
	'plans-launch': 'plans',
	'plans-personal': 'plans',
	'plans-premium': 'plans',
	'plans-site-selected': 'plans',
	'plans-site-selected-legacy': 'plans',
	'plans-affiliate': 'plans',
	'set-reader-landing': 'set-reader-landing',
	site: 'site',
	'rewind-were-backing': 'rewind-were-backing',
	'rewind-form-creds': 'rewind-form-creds',
	'site-or-domain': 'site-or-domain',
	'site-picker': 'site-picker',
	'site-options': 'site-options',
	'store-options': 'site-options',
	'store-features': 'store-features',
	'starting-point': 'starting-point',
	user: 'user',
	'user-new': 'user',
	'oauth2-user': 'user',
	'oauth2-name': 'user',
	'user-social': 'user',
	'p2-site': 'p2-site',
	'p2-confirm-email': 'p2-confirm-email',
	'p2-complete-profile': 'p2-complete-profile',
	'p2-join-workspace': 'p2-join-workspace',
	'plans-business-monthly': 'plans',
	'plans-ecommerce-monthly': 'plans',
	'plans-ecommerce-fulfilled': 'plans',
	'plans-personal-monthly': 'plans',
	'plans-premium-monthly': 'plans',
	'plans-business-2y': 'plans',
	'plans-personal-2y': 'plans',
	'plans-premium-2y': 'plans',
	'plans-business-3y': 'plans',
	'plans-personal-3y': 'plans',
	'plans-premium-3y': 'plans',
	'plans-theme-preselected': 'plans-theme-preselected',
	'new-or-existing-site': 'new-or-existing-site',
	'difm-site-picker': 'difm-site-picker',
	'difm-design-setup-site': 'design-picker',
	'difm-options': 'site-options',
	'difm-store-options': 'site-options',
	'difm-page-picker': 'page-picker',
	'website-content': 'website-content',
	intent: 'intent',
	'initial-intent': 'initial-intent',
	'store-address': 'woocommerce-install/step-store-address',
	'business-info': 'woocommerce-install/step-business-info',
	confirm: 'woocommerce-install/confirm',
	transfer: 'woocommerce-install/transfer',
	'social-profiles': 'social-profiles',
	'storage-addon': 'storage-addon',
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
	const module = await import(
		/* webpackChunkName: "async-load-signup-steps-[request]" */
		/* webpackInclude: /signup\/steps\/[0-9a-z/-]+\/index\.[j|t]sx$/ */
		/* webpackExclude: /signup\/steps\/[0-9a-z/-]+\/test\/index\.[j|t]sx$/ */
		`calypso/signup/steps/${ moduleName }`
	);
	return module.default;
}

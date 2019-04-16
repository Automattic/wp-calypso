/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import AsyncLoad from 'components/async-load';

const AboutStepComponent = props => (
	<AsyncLoad require="signup/steps/about" placeholder={ null } { ...props } />
);
const CloneStartComponent = props => (
	<AsyncLoad require="signup/steps/clone-start" placeholder={ null } { ...props } />
);
const CloneDestinationComponent = props => (
	<AsyncLoad require="signup/steps/clone-destination" placeholder={ null } { ...props } />
);
const CloneCredentialsComponent = props => (
	<AsyncLoad require="signup/steps/clone-credentials" placeholder={ null } { ...props } />
);
const ClonePointComponent = props => (
	<AsyncLoad require="signup/steps/clone-point" placeholder={ null } { ...props } />
);
const CloneJetpackComponent = props => (
	<AsyncLoad require="signup/steps/clone-jetpack" placeholder={ null } { ...props } />
);
const CloneReadyComponent = props => (
	<AsyncLoad require="signup/steps/clone-ready" placeholder={ null } { ...props } />
);
const CloneCloningComponent = props => (
	<AsyncLoad require="signup/steps/clone-cloning" placeholder={ null } { ...props } />
);
const CredsConfirmComponent = props => (
	<AsyncLoad require="signup/steps/creds-confirm" placeholder={ null } { ...props } />
);
const CredsCompleteComponent = props => (
	<AsyncLoad require="signup/steps/creds-complete" placeholder={ null } { ...props } />
);
const CredsPermissionComponent = props => (
	<AsyncLoad require="signup/steps/creds-permission" placeholder={ null } { ...props } />
);
const DesignTypeComponent = props => (
	<AsyncLoad require="signup/steps/design-type" placeholder={ null } { ...props } />
);
const DesignTypeWithAtomicStoreComponent = props => (
	<AsyncLoad
		require="signup/steps/design-type-with-atomic-store"
		placeholder={ null }
		{ ...props }
	/>
);
const DomainsStepComponent = props => (
	<AsyncLoad require="signup/steps/domains" placeholder={ null } { ...props } />
);
const ImportURLStepComponent = props => (
	<AsyncLoad require="signup/steps/import-url" placeholder={ null } { ...props } />
);
const PlansStepComponent = props => (
	<AsyncLoad require="signup/steps/plans" placeholder={ null } { ...props } />
);
const SiteComponent = props => (
	<AsyncLoad require="signup/steps/site" placeholder={ null } { ...props } />
);
const RebrandCitiesWelcomeComponent = props => (
	<AsyncLoad require="signup/steps/rebrand-cities-welcome" placeholder={ null } { ...props } />
);
const RewindMigrate = props => (
	<AsyncLoad require="signup/steps/rewind-migrate" placeholder={ null } { ...props } />
);
const RewindWereBacking = props => (
	<AsyncLoad require="signup/steps/rewind-were-backing" placeholder={ null } { ...props } />
);
const RewindAddCreds = props => (
	<AsyncLoad require="signup/steps/rewind-add-creds" placeholder={ null } { ...props } />
);
const RewindFormCreds = props => (
	<AsyncLoad require="signup/steps/rewind-form-creds" placeholder={ null } { ...props } />
);
const SiteOrDomainComponent = props => (
	<AsyncLoad require="signup/steps/site-or-domain" placeholder={ null } { ...props } />
);
const SitePicker = props => (
	<AsyncLoad require="signup/steps/site-picker" placeholder={ null } { ...props } />
);
const SiteTitleComponent = props => (
	<AsyncLoad require="signup/steps/site-title" placeholder={ null } { ...props } />
);
const SiteStyleComponent = props => (
	<AsyncLoad require="signup/steps/site-style" placeholder={ null } { ...props } />
);
const SiteTopicComponent = props => (
	<AsyncLoad require="signup/steps/site-topic" placeholder={ null } { ...props } />
);
const SiteTypeComponent = props => (
	<AsyncLoad require="signup/steps/site-type" placeholder={ null } { ...props } />
);
const SiteInformationComponent = props => (
	<AsyncLoad require="signup/steps/site-information" placeholder={ null } { ...props } />
);
const SurveyStepComponent = props => (
	<AsyncLoad require="signup/steps/survey" placeholder={ null } { ...props } />
);
const ThemeSelectionComponent = props => (
	<AsyncLoad require="signup/steps/theme-selection" placeholder={ null } { ...props } />
);
const UserSignupComponent = props => (
	<AsyncLoad require="signup/steps/user" placeholder={ null } { ...props } />
);
const PlansStepWithoutFreePlan = props => (
	<AsyncLoad require="signup/steps/plans-without-free" placeholder={ null } { ...props } />
);
const PlansAtomicStoreComponent = props => (
	<AsyncLoad require="signup/steps/plans-atomic-store" placeholder={ null } { ...props } />
);
const ReaderLandingStepComponent = props => (
	<AsyncLoad require="signup/steps/reader-landing" placeholder={ null } { ...props } />
);
const LaunchSiteComponent = props => (
	<AsyncLoad require="signup/steps/launch-site" placeholder={ null } { ...props } />
);

export default {
	about: AboutStepComponent,
	'clone-start': CloneStartComponent,
	'clone-destination': CloneDestinationComponent,
	'clone-credentials': CloneCredentialsComponent,
	'clone-point': ClonePointComponent,
	'clone-jetpack': CloneJetpackComponent,
	'clone-ready': CloneReadyComponent,
	'clone-cloning': CloneCloningComponent,
	'creds-confirm': CredsConfirmComponent,
	'creds-complete': CredsCompleteComponent,
	'creds-permission': CredsPermissionComponent,
	'design-type': DesignTypeComponent,
	'design-type-with-store-nux': DesignTypeWithAtomicStoreComponent,
	domains: DomainsStepComponent,
	'domains-store': DomainsStepComponent,
	'domain-only': DomainsStepComponent,
	'domains-theme-preselected': DomainsStepComponent,
	'domains-launch': DomainsStepComponent,
	'from-url': ImportURLStepComponent,
	launch: LaunchSiteComponent,
	plans: PlansStepComponent,
	'plans-launch': PlansStepComponent,
	'plans-personal': PlansStepComponent,
	'plans-premium': PlansStepComponent,
	'plans-business': PlansStepComponent,
	'plans-store-nux': PlansAtomicStoreComponent,
	'plans-site-selected': PlansStepWithoutFreePlan,
	site: SiteComponent,
	'rebrand-cities-welcome': RebrandCitiesWelcomeComponent,
	'rewind-migrate': RewindMigrate,
	'rewind-were-backing': RewindWereBacking,
	'rewind-add-creds': RewindAddCreds,
	'rewind-form-creds': RewindFormCreds,
	'site-information': SiteInformationComponent,
	'site-information-without-domains': SiteInformationComponent,
	'site-information-title': SiteInformationComponent,
	'site-information-address': SiteInformationComponent,
	'site-information-phone': SiteInformationComponent,
	'site-or-domain': SiteOrDomainComponent,
	'site-picker': SitePicker,
	'site-style': SiteStyleComponent,
	'site-title': SiteTitleComponent,
	'site-topic': SiteTopicComponent,
	'site-type': SiteTypeComponent,
	survey: SurveyStepComponent,
	'survey-user': UserSignupComponent,
	test:
		process.env.NODE_ENV === 'development'
			? require( 'signup/steps/test-step' ).default
			: undefined,
	themes: ThemeSelectionComponent,
	'website-themes': ThemeSelectionComponent,
	'blog-themes': ThemeSelectionComponent,
	'themes-site-selected': ThemeSelectionComponent,
	user: UserSignupComponent,
	'oauth2-user': UserSignupComponent,
	'oauth2-name': UserSignupComponent,
	displayname: UserSignupComponent,
	'reader-landing': ReaderLandingStepComponent,
	// Steps with preview
	'site-style-with-preview': SiteStyleComponent,
	'site-topic-with-preview': SiteTopicComponent,
	'site-information-with-preview': SiteInformationComponent,
	'site-information-title-with-preview': SiteInformationComponent,
	'site-information-address-with-preview': SiteInformationComponent,
	'site-information-phone-with-preview': SiteInformationComponent,
	'domains-with-preview': DomainsStepComponent,
};

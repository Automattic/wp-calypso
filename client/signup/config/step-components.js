/** @format */
/**
 * Internal dependencies
 */
import AboutStepComponent from 'signup/steps/about';
import CloneStartComponent from 'signup/steps/clone-start';
import CloneDestinationComponent from 'signup/steps/clone-destination';
import CloneCredentialsComponent from 'signup/steps/clone-credentials';
import ClonePointComponent from 'signup/steps/clone-point';
import CloneJetpackComponent from 'signup/steps/clone-jetpack';
import CloneReadyComponent from 'signup/steps/clone-ready';
import CloneCloningComponent from 'signup/steps/clone-cloning';
import CredsConfirmComponent from 'signup/steps/creds-confirm';
import CredsCompleteComponent from 'signup/steps/creds-complete';
import CredsPermissionComponent from 'signup/steps/creds-permission';
import DesignTypeComponent from 'signup/steps/design-type';
import DesignTypeWithAtomicStoreComponent from 'signup/steps/design-type-with-atomic-store';
import DomainsStepComponent from 'signup/steps/domains';
import ImportURLStepComponent from 'signup/steps/import-url';
import PlansStepComponent from 'signup/steps/plans';
import SiteComponent from 'signup/steps/site';
import RebrandCitiesWelcomeComponent from 'signup/steps/rebrand-cities-welcome';
import RewindMigrate from 'signup/steps/rewind-migrate';
import RewindWereBacking from 'signup/steps/rewind-were-backing';
import RewindAddCreds from 'signup/steps/rewind-add-creds';
import RewindFormCreds from 'signup/steps/rewind-form-creds';
import SiteOrDomainComponent from 'signup/steps/site-or-domain';
import SitePicker from 'signup/steps/site-picker';
import SiteTitleComponent from 'signup/steps/site-title';
import SiteStyleComponent from 'signup/steps/site-style';
import SiteTopicComponent from 'signup/steps/site-topic';
import SiteTypeComponent from 'signup/steps/site-type';
import SiteInformationComponent from 'signup/steps/site-information';
import SurveyStepComponent from 'signup/steps/survey';
import ThemeSelectionComponent from 'signup/steps/theme-selection';
import UserSignupComponent from 'signup/steps/user';
import PlansStepWithoutFreePlan from 'signup/steps/plans-without-free';
import PlansAtomicStoreComponent from 'signup/steps/plans-atomic-store';
import ReaderLandingStepComponent from 'signup/steps/reader-landing';

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
	'from-url': ImportURLStepComponent,
	plans: PlansStepComponent,
	'plans-store-nux': PlansAtomicStoreComponent,
	'plans-site-selected': PlansStepWithoutFreePlan,
	site: SiteComponent,
	'rebrand-cities-welcome': RebrandCitiesWelcomeComponent,
	'rewind-migrate': RewindMigrate,
	'rewind-were-backing': RewindWereBacking,
	'rewind-add-creds': RewindAddCreds,
	'rewind-form-creds': RewindFormCreds,
	'site-information': SiteInformationComponent,
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
};

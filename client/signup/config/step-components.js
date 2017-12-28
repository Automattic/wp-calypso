/** @format */
/**
 * Internal dependencies
 */
import AboutStepComponent from 'client/signup/steps/about';
import CredsConfirmComponent from 'client/signup/steps/creds-confirm';
import CredsCompleteComponent from 'client/signup/steps/creds-complete';
import CredsPermissionComponent from 'client/signup/steps/creds-permission';
import DesignTypeComponent from 'client/signup/steps/design-type';
import DesignTypeWithStoreComponent from 'client/signup/steps/design-type-with-store';
import DesignTypeWithAtomicStoreComponent from 'client/signup/steps/design-type-with-atomic-store';
import DomainsStepComponent from 'client/signup/steps/domains';
import GetDotBlogPlansStepComponent from 'client/signup/steps/get-dot-blog-plans';
import PlansStepComponent from 'client/signup/steps/plans';
import SiteComponent from 'client/signup/steps/site';
import RebrandCitiesWelcomeComponent from 'client/signup/steps/rebrand-cities-welcome';
import SiteOrDomainComponent from 'client/signup/steps/site-or-domain';
import SitePicker from 'client/signup/steps/site-picker';
import SiteTitleComponent from 'client/signup/steps/site-title';
import SurveyStepComponent from 'client/signup/steps/survey';
import ThemeSelectionComponent from 'client/signup/steps/theme-selection';
import UserSignupComponent from 'client/signup/steps/user';
import PlansStepWithoutFreePlan from 'client/signup/steps/plans-without-free';
import PlansAtomicStoreComponent from 'client/signup/steps/plans-atomic-store';

export default {
	about: AboutStepComponent,
	'creds-confirm': CredsConfirmComponent,
	'creds-complete': CredsCompleteComponent,
	'creds-permission': CredsPermissionComponent,
	'design-type': DesignTypeComponent,
	'design-type-with-store': DesignTypeWithStoreComponent,
	'design-type-with-store-nux': DesignTypeWithAtomicStoreComponent,
	domains: DomainsStepComponent,
	'domain-only': DomainsStepComponent,
	'domains-theme-preselected': DomainsStepComponent,
	'jetpack-user': UserSignupComponent,
	'get-dot-blog-plans': GetDotBlogPlansStepComponent,
	'get-dot-blog-themes': ThemeSelectionComponent,
	plans: PlansStepComponent,
	'plans-store-nux': PlansAtomicStoreComponent,
	'plans-site-selected': PlansStepWithoutFreePlan,
	site: SiteComponent,
	'rebrand-cities-welcome': RebrandCitiesWelcomeComponent,
	'site-or-domain': SiteOrDomainComponent,
	'site-picker': SitePicker,
	'site-title': SiteTitleComponent,
	survey: SurveyStepComponent,
	'survey-user': UserSignupComponent,
	test: process.env.NODE_ENV === 'development' ? require( 'signup/steps/test-step' ) : undefined,
	themes: ThemeSelectionComponent,
	'website-themes': ThemeSelectionComponent,
	'blog-themes': ThemeSelectionComponent,
	'portfolio-themes': ThemeSelectionComponent,
	'themes-site-selected': ThemeSelectionComponent,
	user: UserSignupComponent,
	'oauth2-user': UserSignupComponent,
};

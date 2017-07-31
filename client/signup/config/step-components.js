/**
 * Internal dependencies
 */
import config from 'config';
import DesignTypeComponent from 'signup/steps/design-type';
import DesignTypeWithStoreComponent from 'signup/steps/design-type-with-store';
import DomainsStepComponent from 'signup/steps/domains';
import GetDotBlogPlansStepComponent from 'signup/steps/get-dot-blog-plans';
import PlansStepComponent from 'signup/steps/plans';
import SiteComponent from 'signup/steps/site';
import SiteOrDomainComponent from 'signup/steps/site-or-domain';
import SitePicker from 'signup/steps/site-picker';
import SiteTitleComponent from 'signup/steps/site-title';
import SurveyStepComponent from 'signup/steps/survey';
import ThemeSelectionComponent from 'signup/steps/theme-selection';
import UserSignupComponent from 'signup/steps/user';
import PlansStepWithoutFreePlan from 'signup/steps/plans-without-free';
import JPOSiteTitleComponent from 'signup/steps/jpo-site-title';
import JPOSiteTypeComponent from 'signup/steps/jpo-site-type';
import JPOHomepageComponent from 'signup/steps/jpo-homepage';
import JPOContactFormComponent from 'signup/steps/jpo-contact-form';
import JPOSummaryComponent from 'signup/steps/jpo-summary';

export default {
	'design-type': DesignTypeComponent,
	'design-type-with-store': DesignTypeWithStoreComponent,
	domains: DomainsStepComponent,
	'domain-only': DomainsStepComponent,
	'domains-theme-preselected': DomainsStepComponent,
	'jetpack-user': UserSignupComponent,
	'jpo-site-title': JPOSiteTitleComponent,
	'jpo-site-type': JPOSiteTypeComponent,
	'jpo-homepage': JPOHomepageComponent,
	'jpo-contact-form': JPOContactFormComponent,
	'jpo-summary': JPOSummaryComponent,
	'get-dot-blog-plans': GetDotBlogPlansStepComponent,
	'get-dot-blog-themes': ThemeSelectionComponent,
	plans: PlansStepComponent,
	'plans-site-selected': PlansStepWithoutFreePlan,
	site: SiteComponent,
	'site-or-domain': SiteOrDomainComponent,
	'site-picker': SitePicker,
	'site-title': SiteTitleComponent,
	survey: SurveyStepComponent,
	'survey-user': UserSignupComponent,
	test: config( 'env' ) === 'development' ? require( 'signup/steps/test-step' ) : undefined,
	themes: ThemeSelectionComponent,
	'themes-site-selected': ThemeSelectionComponent,
	user: UserSignupComponent,
	'user-social': UserSignupComponent,
};

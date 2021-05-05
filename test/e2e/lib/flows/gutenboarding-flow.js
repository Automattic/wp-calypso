/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import AcquireIntentPage from '../pages/gutenboarding/acquire-intent-page.js';
import DesignLocatorPage from '../pages/gutenboarding/designs-page.js';
import StylePreviewPage from '../pages/gutenboarding/style-preview-page.js';
import PlansPage from '../pages/gutenboarding/plans-page.js';
import DomainsPage from '../pages/gutenboarding/domains-page.js';
import FeaturesPage from '../pages/gutenboarding/features-page.js';
import SignupPage from '../pages/gutenboarding/signup-page.js';
import GutenbergEditorComponent from '../gutenberg/gutenberg-editor-component';
import * as dataHelper from '../../lib/data-helper';

export default class CreateSiteFlow {
	constructor( driver ) {
		this.driver = driver;
	}

	async skipAllSteps( name ) {
		const acquireIntentPage = await AcquireIntentPage.Expect( this.driver );

		await acquireIntentPage.enterSiteTitle( name || dataHelper.getNewBlogName() );
		await acquireIntentPage.goToNextStep();

		const domainsPage = await DomainsPage.Expect( this.driver );
		await domainsPage.skipStep();

		const designLocatorPage = await DesignLocatorPage.Expect( this.driver );
		await designLocatorPage.selectFreeDesign();

		const stylePreviewPage = await StylePreviewPage.Expect( this.driver );
		await stylePreviewPage.continue();

		const featuresPage = await FeaturesPage.Expect( this.driver );
		await featuresPage.skipStep();

		const plansPage = await PlansPage.Expect( this.driver );
		await plansPage.expandAllPlans();
		await plansPage.selectFreePlan();
	}

	async createFreeSite( name ) {
		await this.skipAllSteps( name );

		const gEditorComponent = await GutenbergEditorComponent.Expect( this.driver );
		await gEditorComponent.initEditor();
	}

	async signupAndCreateFreeSite( { siteName, emailAddress, password } = {} ) {
		emailAddress =
			emailAddress || dataHelper.getEmailAddress( this.accountName, config.get( 'signupInboxId' ) );
		password = password || config.get( 'passwordForNewTestSignUps' );

		await this.skipAllSteps( siteName );

		const signupPage = await SignupPage.Expect( this.driver );
		await signupPage.enterEmail( emailAddress );
		await signupPage.enterPassword( password );
		await signupPage.createAccount();

		const gEditorComponent = await GutenbergEditorComponent.Expect( this.driver );
		await gEditorComponent.initEditor();
	}
}

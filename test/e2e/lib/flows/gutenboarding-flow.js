/**
 * Internal dependencies
 */
import AcquireIntentPage from '../pages/gutenboarding/acquire-intent-page.js';
import DesignSelectorPage from '../pages/gutenboarding/design-selector-page.js';
import StylePreviewPage from '../pages/gutenboarding/style-preview-page.js';
import PlansPage from '../pages/gutenboarding/plans-page.js';
import DomainsPage from '../pages/gutenboarding/domains-page.js';
import FeaturesPage from '../pages/gutenboarding/features-page.js';
import GutenbergEditorComponent from '../gutenberg/gutenberg-editor-component';

export default class CreateSiteFlow {
	constructor( driver ) {
		this.driver = driver;
	}

	async createFreeSite( name ) {
		const acquireIntentPage = await AcquireIntentPage.Expect( this.driver );
		if ( name ) {
			await acquireIntentPage.enterSiteTitle( name );
			await acquireIntentPage.goToNextStep();
		} else {
			await acquireIntentPage.skipStep();
		}

		const designSelectorPage = await DesignSelectorPage.Expect( this.driver );
		await designSelectorPage.selectFreeDesign();

		const stylePreviewPage = await StylePreviewPage.Expect( this.driver );
		await stylePreviewPage.continue();

		const domainsPage = await DomainsPage.Expect( this.driver );
		await domainsPage.skipStep();

		const featureswPage = await FeaturesPage.Expect( this.driver );
		await featureswPage.skipStep();

		const plansPage = await PlansPage.Expect( this.driver );
		await plansPage.expandAllPlans();
		await plansPage.selectFreePlan();

		const gEditorComponent = await GutenbergEditorComponent.Expect( this.driver );
		await gEditorComponent.initEditor();
	}
}

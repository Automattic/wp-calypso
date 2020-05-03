/**
 * External dependencies
 */
import assert from 'assert';

/**
 * Internal dependencies
 */
import UpsellPage from '../pages/signup/upsell-page';
import ChecklistPage from '../pages/checklist-page';
import InlineHelpChecklistComponent from '../components/inline-help-checklist-component.js';
import SitePreviewComponent from '../components/site-preview-component.js';

export const canSeeTheSitePreview = () => {
	step( 'Can then see the site preview', async function () {
		const sitePreviewComponent = await SitePreviewComponent.Expect( this.driver );

		const toolbar = await sitePreviewComponent.sitePreviewToolbar();
		const placeholder = await sitePreviewComponent.contentPlaceholder();

		assert( toolbar, 'The preview toolbar does not exist.' );
		assert( placeholder, 'The preview content placeholder does not exist.' );
		await sitePreviewComponent.enterSitePreview();

		const siteBody = await sitePreviewComponent.siteBody();

		assert( siteBody, 'The site body does not appear in the iframe.' );

		return await sitePreviewComponent.leaveSitePreview();
	} );
};

export const canSeeTheInlineHelpCongratulations = () => {
	step( 'Can then see the inlineHelp congratulations', async function () {
		const inlineHelpChecklistComponent = await InlineHelpChecklistComponent.Expect( this.driver );

		const congratulations = await inlineHelpChecklistComponent.congratulationsExists();

		assert( congratulations, 'The inlineHelp congratulations does not exist.' );

		return await inlineHelpChecklistComponent.leaveInlineHelpChecklist();
	} );
};

export const canSeeTheOnboardingChecklist = () => {
	step( 'Can then see the onboarding checklist', async function () {
		// dismiss upsell page if displayed
		try {
			const upsellPage = await UpsellPage.Expect( this.driver );
			await upsellPage.declineOffer();
		} catch ( e ) {}

		const checklistPage = await ChecklistPage.Expect( this.driver );
		const header = await checklistPage.headerExists();

		return assert( header, 'The checklist header does not exist.' );
	} );
};

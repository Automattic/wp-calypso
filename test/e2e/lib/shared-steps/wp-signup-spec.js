/** @format */
import assert from 'assert';
import ChecklistPage from '../pages/checklist-page';
import SitePreviewComponent from '../components/site-preview-component.js';

export const canSeeTheSitePreview = () => {
	step( 'Can then see the site preview', async function() {
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

export const canSeeTheOnboardingChecklist = () => {
	step( 'Can then see the onboarding checklist', async function() {
		const checklistPage = await ChecklistPage.Expect( this.driver );
		const header = await checklistPage.headerExists();
		const subheader = await checklistPage.subheaderExists();

		assert( header, 'The checklist header does not exist.' );
		return assert( subheader, 'The checklist subheader does not exist.' );
	} );
};

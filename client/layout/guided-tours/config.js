/**
 * Internal dependencies
 */
import { combineTours } from 'layout/guided-tours/config-elements';
import { MainTour } from 'layout/guided-tours/tours/main-tour';
import { TutorialSitePreviewTour } from 'layout/guided-tours/tours/tutorial-site-preview-tour';
import { GDocsIntegrationTour } from 'layout/guided-tours/tours/gdocs-integration-tour';
import { MenuRemovalTour } from 'layout/guided-tours/tours/menu-removal-tour';

export default combineTours( {
	main: MainTour,
	tutorialSitePreview: TutorialSitePreviewTour,
	gdocsIntegrationTour: GDocsIntegrationTour,
	menuRemoval: MenuRemovalTour,
} );

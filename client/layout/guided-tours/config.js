/**
 * Internal dependencies
 */
import { combineTours } from 'layout/guided-tours/config-elements';
import { MainTour } from 'layout/guided-tours/tours/main-tour';
import { TutorialSitePreviewTour } from 'layout/guided-tours/tours/tutorial-site-preview-tour';
import { GDocsIntegrationTour } from 'layout/guided-tours/tours/gdocs-integration-tour';
import { DesignShowcaseWelcomeTour } from 'layout/guided-tours/tours/design-showcase-welcome-tour';

export default combineTours( {
	main: MainTour,
	tutorialSitePreview: TutorialSitePreviewTour,
	gdocsIntegrationTour: GDocsIntegrationTour,
	designShowcaseWelcome: DesignShowcaseWelcomeTour,
} );

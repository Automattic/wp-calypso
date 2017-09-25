/**
 * Internal dependencies
 */
import { combineTours } from 'layout/guided-tours/config-elements';
import { EditorBasicsTour } from 'layout/guided-tours/tours/editor-basics-tour';
import { GDocsIntegrationTour } from 'layout/guided-tours/tours/gdocs-integration-tour';
import { MainTour } from 'layout/guided-tours/tours/main-tour';
import { MediaBasicsTour } from 'layout/guided-tours/tours/media-basics-tour';
import { SimplePaymentsTour } from 'layout/guided-tours/tours/simple-payments-tour';
import { TutorialSitePreviewTour } from 'layout/guided-tours/tours/tutorial-site-preview-tour';

export default combineTours( {
	main: MainTour,
	editorBasicsTour: EditorBasicsTour,
	mediaBasicsTour: MediaBasicsTour,
	tutorialSitePreview: TutorialSitePreviewTour,
	gdocsIntegrationTour: GDocsIntegrationTour,
	simplePaymentsTour: SimplePaymentsTour,
} );

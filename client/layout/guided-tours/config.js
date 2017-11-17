/** @format */

/**
 * Internal dependencies
 */

import { combineTours } from 'layout/guided-tours/config-elements';
import { MainTour } from 'layout/guided-tours/tours/main-tour';
import { TutorialSitePreviewTour } from 'layout/guided-tours/tours/tutorial-site-preview-tour';
import { GDocsIntegrationTour } from 'layout/guided-tours/tours/gdocs-integration-tour';
import { SimplePaymentsTour } from 'layout/guided-tours/tours/simple-payments-tour';
import { EditorBasicsTour } from 'layout/guided-tours/tours/editor-basics-tour';
import { MediaBasicsTour } from 'layout/guided-tours/tours/media-basics-tour';
import { ActivityLogTour } from 'layout/guided-tours/tours/activity-log-tour';
import { SimplePaymentsEndOfYearGuide } from 'layout/guided-tours/tours/simple-payments-end-of-year-guide';

export default combineTours( {
	main: MainTour,
	editorBasicsTour: EditorBasicsTour,
	mediaBasicsTour: MediaBasicsTour,
	tutorialSitePreview: TutorialSitePreviewTour,
	gdocsIntegrationTour: GDocsIntegrationTour,
	simplePaymentsTour: SimplePaymentsTour,
	activityLogTour: ActivityLogTour,
	simplePaymentsEndOfYearGuide: SimplePaymentsEndOfYearGuide,
} );

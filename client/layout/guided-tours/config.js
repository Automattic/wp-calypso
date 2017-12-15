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
import { SimplePaymentsEndOfYearGuide } from 'layout/guided-tours/tours/simple-payments-end-of-year-guide';
import { ChecklistSiteIconTour } from 'layout/guided-tours/tours/checklist-site-icon-tour';
import { ChecklistSiteTaglineTour } from 'layout/guided-tours/tours/checklist-site-tagline-tour';
import { ChecklistSiteTitleTour } from 'layout/guided-tours/tours/checklist-site-title-tour';

export default combineTours( {
	checklistSiteIcon: ChecklistSiteIconTour,
	checklistSiteTagline: ChecklistSiteTaglineTour,
	checklistSiteTitle: ChecklistSiteTitleTour,
	main: MainTour,
	editorBasicsTour: EditorBasicsTour,
	mediaBasicsTour: MediaBasicsTour,
	tutorialSitePreview: TutorialSitePreviewTour,
	gdocsIntegrationTour: GDocsIntegrationTour,
	simplePaymentsTour: SimplePaymentsTour,
	simplePaymentsEndOfYearGuide: SimplePaymentsEndOfYearGuide,
} );

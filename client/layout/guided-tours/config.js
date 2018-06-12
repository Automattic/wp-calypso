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
import { ChecklistAboutPageTour } from 'layout/guided-tours/tours/checklist-about-page-tour';
import { ChecklistContactPageTour } from 'layout/guided-tours/tours/checklist-contact-page-tour';
import { ChecklistPublishPostTour } from 'layout/guided-tours/tours/checklist-publish-post-tour';
import { ChecklistSiteIconTour } from 'layout/guided-tours/tours/checklist-site-icon-tour';
import { ChecklistSiteTaglineTour } from 'layout/guided-tours/tours/checklist-site-tagline-tour';
import { ChecklistSiteTitleTour } from 'layout/guided-tours/tours/checklist-site-title-tour';
import { ChecklistUserAvatarTour } from 'layout/guided-tours/tours/checklist-user-avatar-tour';
import { JetpackBasicTour } from 'layout/guided-tours/tours/jetpack-basic-tour';
import { JetpackMonitoringTour } from 'layout/guided-tours/tours/jetpack-monitoring-tour';
import { SimplePaymentsEmailTour } from 'layout/guided-tours/tours/simple-payments-email-tour';

export default combineTours( {
	checklistAboutPage: ChecklistAboutPageTour,
	checklistContactPage: ChecklistContactPageTour,
	checklistPublishPost: ChecklistPublishPostTour,
	checklistSiteIcon: ChecklistSiteIconTour,
	checklistSiteTagline: ChecklistSiteTaglineTour,
	checklistSiteTitle: ChecklistSiteTitleTour,
	checklistUserAvatar: ChecklistUserAvatarTour,
	jetpack: JetpackBasicTour,
	jetpackMonitoring: JetpackMonitoringTour,
	main: MainTour,
	editorBasicsTour: EditorBasicsTour,
	mediaBasicsTour: MediaBasicsTour,
	tutorialSitePreview: TutorialSitePreviewTour,
	gdocsIntegrationTour: GDocsIntegrationTour,
	simplePaymentsTour: SimplePaymentsTour,
	simplePaymentsEmailTour: SimplePaymentsEmailTour,
} );

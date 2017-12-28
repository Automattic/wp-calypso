/** @format */

/**
 * Internal dependencies
 */

import { combineTours } from 'client/layout/guided-tours/config-elements';
import { MainTour } from 'client/layout/guided-tours/tours/main-tour';
import { TutorialSitePreviewTour } from 'client/layout/guided-tours/tours/tutorial-site-preview-tour';
import { GDocsIntegrationTour } from 'client/layout/guided-tours/tours/gdocs-integration-tour';
import { SimplePaymentsTour } from 'client/layout/guided-tours/tours/simple-payments-tour';
import { EditorBasicsTour } from 'client/layout/guided-tours/tours/editor-basics-tour';
import { MediaBasicsTour } from 'client/layout/guided-tours/tours/media-basics-tour';
import { ChecklistAboutPageTour } from 'client/layout/guided-tours/tours/checklist-about-page-tour';
import { ChecklistContactPageTour } from 'client/layout/guided-tours/tours/checklist-contact-page-tour';
import { ChecklistPublishPostTour } from 'client/layout/guided-tours/tours/checklist-publish-post-tour';
import { ChecklistSiteIconTour } from 'client/layout/guided-tours/tours/checklist-site-icon-tour';
import { ChecklistSiteTaglineTour } from 'client/layout/guided-tours/tours/checklist-site-tagline-tour';
import { ChecklistSiteTitleTour } from 'client/layout/guided-tours/tours/checklist-site-title-tour';
import { ChecklistUserAvatarTour } from 'client/layout/guided-tours/tours/checklist-user-avatar-tour';

export default combineTours( {
	checklistAboutPage: ChecklistAboutPageTour,
	checklistContactPage: ChecklistContactPageTour,
	checklistPublishPost: ChecklistPublishPostTour,
	checklistSiteIcon: ChecklistSiteIconTour,
	checklistSiteTagline: ChecklistSiteTaglineTour,
	checklistSiteTitle: ChecklistSiteTitleTour,
	checklistUserAvatar: ChecklistUserAvatarTour,
	main: MainTour,
	editorBasicsTour: EditorBasicsTour,
	mediaBasicsTour: MediaBasicsTour,
	tutorialSitePreview: TutorialSitePreviewTour,
	gdocsIntegrationTour: GDocsIntegrationTour,
	simplePaymentsTour: SimplePaymentsTour,
} );

/**
 * Internal dependencies
 */

import { ActivityLogJetpackIntroTour } from './tours/activity-log-jetpack-intro-tour';
import { ActivityLogWpcomIntroTour } from './tours/activity-log-wpcom-intro-tour';
import { ChecklistAboutPageTour } from './tours/checklist-about-page-tour';
import { ChecklistContactPageTour } from './tours/checklist-contact-page-tour';
import { ChecklistDomainRegisterTour } from './tours/checklist-domain-register-tour';
import { ChecklistPublishPostTour } from './tours/checklist-publish-post-tour';
import { ChecklistSiteIconTour } from './tours/checklist-site-icon-tour';
import { ChecklistSiteTaglineTour } from './tours/checklist-site-tagline-tour';
import { ChecklistSiteTitleTour } from './tours/checklist-site-title-tour';
import { ChecklistUserAvatarTour } from './tours/checklist-user-avatar-tour';
import { ChecklistUserEmailTour } from './tours/checklist-user-email-tour';
import { EditorBasicsTour } from './tours/editor-basics-tour';
import { GDocsIntegrationTour } from './tours/gdocs-integration-tour';
import { JetpackBackupsRewindTour } from './tours/jetpack-backups-rewind-tour';
import { JetpackChecklistTour } from './tours/jetpack-checklist-tour';
import { JetpackLazyImagesTour } from './tours/jetpack-lazy-images-tour';
import { JetpackMonitoringTour } from './tours/jetpack-monitoring-tour';
import { JetpackPluginUpdatesTour } from './tours/jetpack-plugin-updates-tour';
import { JetpackSearchTour } from './tours/jetpack-search-tour';
import { JetpackSignInTour } from './tours/jetpack-sign-in-tour';
import { JetpackSiteAcceleratorTour } from './tours/jetpack-site-accelerator-tour';
import { JetpackVideoHostingTour } from './tours/jetpack-video-hosting-tour';
import { MainTour } from './tours/main-tour';
import { MediaBasicsTour } from './tours/media-basics-tour';
import { SimplePaymentsEmailTour } from './tours/simple-payments-email-tour';
import { SimplePaymentsTour } from './tours/simple-payments-tour';
import { TutorialSitePreviewTour } from './tours/tutorial-site-preview-tour';
import combineTours from './config-elements/combine-tours';

export default combineTours( {
	activityLogJetpackIntroTour: ActivityLogJetpackIntroTour,
	activityLogWpcomIntroTour: ActivityLogWpcomIntroTour,
	checklistAboutPage: ChecklistAboutPageTour,
	checklistContactPage: ChecklistContactPageTour,
	checklistDomainRegister: ChecklistDomainRegisterTour,
	checklistPublishPost: ChecklistPublishPostTour,
	checklistSiteIcon: ChecklistSiteIconTour,
	checklistSiteTagline: ChecklistSiteTaglineTour,
	checklistSiteTitle: ChecklistSiteTitleTour,
	checklistUserAvatar: ChecklistUserAvatarTour,
	checklistUserEmail: ChecklistUserEmailTour,
	editorBasicsTour: EditorBasicsTour,
	gdocsIntegrationTour: GDocsIntegrationTour,
	jetpackBackupsRewind: JetpackBackupsRewindTour,
	jetpackChecklistTour: JetpackChecklistTour,
	jetpackLazyImages: JetpackLazyImagesTour,
	jetpackMonitoring: JetpackMonitoringTour,
	jetpackPluginUpdates: JetpackPluginUpdatesTour,
	jetpackSearch: JetpackSearchTour,
	jetpackSignIn: JetpackSignInTour,
	jetpackSiteAccelerator: JetpackSiteAcceleratorTour,
	jetpackVideoHosting: JetpackVideoHostingTour,
	main: MainTour,
	mediaBasicsTour: MediaBasicsTour,
	simplePaymentsEmailTour: SimplePaymentsEmailTour,
	simplePaymentsTour: SimplePaymentsTour,
	tutorialSitePreview: TutorialSitePreviewTour,
} );

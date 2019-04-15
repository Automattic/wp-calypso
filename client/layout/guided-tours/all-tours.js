/** @format */

/**
 * Internal dependencies
 */

import combineTours from 'layout/guided-tours/config-elements/combine-tours';
import { ActivityLogJetpackIntroTour } from 'layout/guided-tours/tours/activity-log-jetpack-intro-tour';
import { ActivityLogWpcomIntroTour } from 'layout/guided-tours/tours/activity-log-wpcom-intro-tour';
import { MainTour } from 'layout/guided-tours/tours/main-tour';
import { TutorialSitePreviewTour } from 'layout/guided-tours/tours/tutorial-site-preview-tour';
import { GDocsIntegrationTour } from 'layout/guided-tours/tours/gdocs-integration-tour';
import { SimplePaymentsTour } from 'layout/guided-tours/tours/simple-payments-tour';
import { EditorBasicsTour } from 'layout/guided-tours/tours/editor-basics-tour';
import { MediaBasicsTour } from 'layout/guided-tours/tours/media-basics-tour';
import { ChecklistAboutPageTour } from 'layout/guided-tours/tours/checklist-about-page-tour';
import { ChecklistContactPageTour } from 'layout/guided-tours/tours/checklist-contact-page-tour';
import { ChecklistDomainRegisterTour } from 'layout/guided-tours/tours/checklist-domain-register-tour';
import { ChecklistPublishPostTour } from 'layout/guided-tours/tours/checklist-publish-post-tour';
import { ChecklistSiteIconTour } from 'layout/guided-tours/tours/checklist-site-icon-tour';
import { ChecklistSiteTaglineTour } from 'layout/guided-tours/tours/checklist-site-tagline-tour';
import { ChecklistSiteTitleTour } from 'layout/guided-tours/tours/checklist-site-title-tour';
import { ChecklistUserAvatarTour } from 'layout/guided-tours/tours/checklist-user-avatar-tour';
import { JetpackBackupsRewindTour } from 'layout/guided-tours/tours/jetpack-backups-rewind-tour';
import { JetpackBasicTour } from 'layout/guided-tours/tours/jetpack-basic-tour';
import { JetpackMonitoringTour } from 'layout/guided-tours/tours/jetpack-monitoring-tour';
import { JetpackPluginUpdatesTour } from 'layout/guided-tours/tours/jetpack-plugin-updates-tour';
import { JetpackSignInTour } from 'layout/guided-tours/tours/jetpack-sign-in-tour';
import { SimplePaymentsEmailTour } from 'layout/guided-tours/tours/simple-payments-email-tour';
import { PluginsBasicTour } from 'layout/guided-tours/tours/plugins-basic-tour';

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
	jetpack: JetpackBasicTour,
	jetpackBackupsRewind: JetpackBackupsRewindTour,
	jetpackMonitoring: JetpackMonitoringTour,
	jetpackPluginUpdates: JetpackPluginUpdatesTour,
	jetpackSignIn: JetpackSignInTour,
	main: MainTour,
	editorBasicsTour: EditorBasicsTour,
	mediaBasicsTour: MediaBasicsTour,
	tutorialSitePreview: TutorialSitePreviewTour,
	gdocsIntegrationTour: GDocsIntegrationTour,
	simplePaymentsTour: SimplePaymentsTour,
	simplePaymentsEmailTour: SimplePaymentsEmailTour,
	pluginsBasicTour: PluginsBasicTour,
} );

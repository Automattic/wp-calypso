/**
 * Internal dependencies
 */

import { ChecklistSiteTitleTour } from './tours/checklist-site-title-tour';
import { JetpackChecklistTour } from './tours/jetpack-checklist-tour';
import { JetpackLazyImagesTour } from './tours/jetpack-lazy-images-tour';
import { JetpackMonitoringTour } from './tours/jetpack-monitoring-tour';
import { JetpackPluginUpdatesTour } from './tours/jetpack-plugin-updates-tour';
import { JetpackSearchTour } from './tours/jetpack-search-tour';
import { JetpackSignInTour } from './tours/jetpack-sign-in-tour';
import { JetpackSiteAcceleratorTour } from './tours/jetpack-site-accelerator-tour';
import { JetpackVideoHostingTour } from './tours/jetpack-video-hosting-tour';
import { MainTour } from './tours/main-tour';
import { marketingConnectionsTour } from './tours/marketing-connections-tour';
import { MediaBasicsTour } from './tours/media-basics-tour';
import { TutorialSitePreviewTour } from './tours/tutorial-site-preview-tour';
import combineTours from './config-elements/combine-tours';

export default combineTours( {
	checklistSiteTitle: ChecklistSiteTitleTour,
	jetpackChecklistTour: JetpackChecklistTour,
	jetpackLazyImages: JetpackLazyImagesTour,
	jetpackMonitoring: JetpackMonitoringTour,
	jetpackPluginUpdates: JetpackPluginUpdatesTour,
	jetpackSearch: JetpackSearchTour,
	jetpackSignIn: JetpackSignInTour,
	jetpackSiteAccelerator: JetpackSiteAcceleratorTour,
	jetpackVideoHosting: JetpackVideoHostingTour,
	main: MainTour,
	marketingConnectionsTour: marketingConnectionsTour,
	mediaBasicsTour: MediaBasicsTour,
	tutorialSitePreview: TutorialSitePreviewTour,
} );

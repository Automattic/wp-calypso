import { translate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import { recordPageView } from 'calypso/lib/analytics/page-view';
import { sectionify } from 'calypso/lib/route';
import { Design } from './design';
import { StepNavProvider } from './hooks/use-setup-nav';
import { IntentScreen } from './intent-screen';
import { SetupSite } from './setup-site';
import { SiteOptions } from './site-options';
import { StartingPoint } from './starting-point';
import { StepSlug } from './types';

export const setupSite: PageJS.Callback = ( context, next ) => {
	const pageTitle = translate( 'Setup your site' );

	const basePath = sectionify( context.path );
	recordPageView( basePath, pageTitle );

	const stepSlug: StepSlug = context.params.stepSlug;
	const StepComponent = getStepComponent( stepSlug );

	context.primary = (
		<>
			<StepNavProvider currentStep={ stepSlug }>
				<DocumentHead title={ pageTitle } />
				<SetupSite step={ <StepComponent /> } />
			</StepNavProvider>
		</>
	);

	next();
};

function getStepComponent( stepSlug: StepSlug ) {
	switch ( stepSlug ) {
		case undefined:
			return IntentScreen;
		case 'site-options':
			return SiteOptions;
		case 'starting-point':
			return StartingPoint;
		case 'design':
			return Design;
	}
}

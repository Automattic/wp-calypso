import { StepContainer } from '@automattic/onboarding';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { NavigationControls } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';

type SiteEditorProps = {
	navigation: NavigationControls;
	flow: string;
};
const debug = debugFactory( 'stepper:ai-assembler' );

const SiteEditor: Step = ( { navigation }: SiteEditorProps ) => {
	const translate = useTranslate();
	const site = useSite();

	if ( site?.URL ) {
		debug( 'Redirecting to site editor' );
		window.location.replace( site.URL + '/wp-admin/site-editor.php' );
		return;
	}

	return (
		<>
			<DocumentHead title={ translate( 'Edit your site' ) } />
			<StepContainer
				stepName="site-editor"
				goNext={ navigation.goNext }
				isFullLayout={ true }
				skipLabelText={ translate( 'Skip for now' ) }
				skipButtonAlign="top"
				hideBack={ true }
				stepContent={ <></> }
				formattedHeader={
					<FormattedHeader
						id="site-editor-header"
						headerText={ <>{ translate( 'Edit your site' ) }</> }
					/>
				}
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default SiteEditor;

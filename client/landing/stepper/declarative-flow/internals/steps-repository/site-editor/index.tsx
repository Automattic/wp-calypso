import { StepContainer } from '@automattic/onboarding';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import { ThunkAction } from 'redux-thunk';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { NavigationControls } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useDispatch as useReduxDispatch } from 'calypso/state';
import { activateOrInstallThenActivate } from 'calypso/state/themes/actions';
import type { Step } from '../../types';
import type { AnyAction } from 'redux';

type SiteEditorProps = {
	navigation: NavigationControls;
	flow: string;
};
const debug = debugFactory( 'stepper:ai-assembler' );

const SiteEditor: Step = ( { flow }: SiteEditorProps ) => {
	const translate = useTranslate();
	const site = useSite();
	const reduxDispatch = useReduxDispatch();

	let conditions: PromiseLike< string > = Promise.resolve( '' );

	if ( site && flow === 'ai-assembler' ) {
		conditions = reduxDispatch(
			activateOrInstallThenActivate( 'assembler', site.ID, 'assembler', false ) as ThunkAction<
				PromiseLike< string >,
				any,
				any,
				AnyAction
			>
		);
	}

	if ( site && site.URL ) {
		debug( 'Redirecting to site editor' );
		conditions.then( () => {
			window.location.replace( site.URL + '/wp-admin/site-editor.php' );
		} );
	}

	return (
		<>
			<DocumentHead title={ translate( 'Edit your site' ) } />
			<StepContainer
				stepName="site-editor"
				isFullLayout={ true }
				skipLabelText={ translate( 'Skip for now' ) }
				skipButtonAlign="top"
				hideBack={ true }
				hideNext={ true }
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

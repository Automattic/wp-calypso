import page from '@automattic/calypso-router';
import {
	Button,
	__experimentalSpacer as Spacer,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useCallback, useState } from 'react';
import A4AModal from 'calypso/a8c-for-agencies/components/a4a-modal';
import { A4A_AMPLIFY_REPORTS_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useStartAmplifyAnalysis from 'calypso/a8c-for-agencies/data/amplify/use-start-amplify-analysis';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import AnalysisProgress from './analysis-progress';
import AnalysisTypeCards from './analysis-type-cards';
import AmplifySiteSelector from './site-selector';
import type { AmplifyMode } from 'calypso/a8c-for-agencies/data/amplify/types';

import './style.scss';

export default function AmplifyAddSiteModal( { onClose }: { onClose: () => void } ) {
	const dispatch = useDispatch();

	const [ targetUrl, setTargetUrl ] = useState( '' );
	const [ mode, setMode ] = useState< AmplifyMode | null >( null );
	const [ inProgress, setInProgress ] = useState( false );

	const handleTargetChange = useCallback( ( url: string ) => setTargetUrl( url ), [] );

	const mutation = useStartAmplifyAnalysis( {
		// The run is seeded into the jobs cache by the hook, so closing this
		// modal reveals the in-progress row. Here we just switch to the
		// progress view instead of showing a notice.
		onSuccess: () => setInProgress( true ),
		onError: () => {
			dispatch(
				errorNotice( __( 'Could not start the analysis. Please try again.' ), {
					id: 'amplify-analysis-error',
					duration: 8000,
				} )
			);
		},
	} );

	const handleViewReports = () => {
		const isReportsPage = window.location.pathname === A4A_AMPLIFY_REPORTS_LINK;
		if ( isReportsPage ) {
			onClose();
			return;
		}
		page.redirect( A4A_AMPLIFY_REPORTS_LINK );
	};

	const handleSubmit = () => {
		if ( ! targetUrl || ! mode ) {
			return;
		}
		dispatch( recordTracksEvent( 'calypso_a4a_amplify_start_analysis_click', { mode } ) );
		mutation.mutate( { url: targetUrl, mode } );
	};

	if ( inProgress ) {
		return (
			<A4AModal
				title={ __( 'Analysis in progress' ) }
				subtile={ null }
				onClose={ onClose }
				showCloseButton={ false }
				extraActions={
					<Button variant="primary" onClick={ handleViewReports }>
						{ __( 'View reports' ) }
					</Button>
				}
			>
				<AnalysisProgress url={ targetUrl } />
			</A4AModal>
		);
	}

	return (
		<A4AModal
			title={ __( 'Amplify a site' ) }
			subtile={ __( 'Enter a URL or pick a connected site, then choose the analysis to run.' ) }
			onClose={ onClose }
			extraActions={
				<Button
					variant="primary"
					onClick={ handleSubmit }
					disabled={ ! targetUrl || ! mode || mutation.isPending }
					isBusy={ mutation.isPending }
				>
					{ __( 'Amplify it' ) }
				</Button>
			}
		>
			<Spacer marginTop={ 4 } marginBottom={ 0 } />
			<VStack spacing={ 6 }>
				<AmplifySiteSelector onChange={ handleTargetChange } disabled={ mutation.isPending } />
				<AnalysisTypeCards value={ mode } onChange={ setMode } />
			</VStack>
		</A4AModal>
	);
}

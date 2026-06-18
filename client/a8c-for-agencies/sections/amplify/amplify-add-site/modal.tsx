import {
	Button,
	__experimentalSpacer as Spacer,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useCallback, useState } from 'react';
import A4AModal from 'calypso/a8c-for-agencies/components/a4a-modal';
import useStartAmplifyAnalysis from 'calypso/a8c-for-agencies/data/amplify/use-start-amplify-analysis';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import AnalysisTypeCards from './analysis-type-cards';
import AmplifySiteSelector from './site-selector';
import type { AmplifyMode } from 'calypso/a8c-for-agencies/data/amplify/types';

import './style.scss';

export default function AmplifyAddSiteModal( { onClose }: { onClose: () => void } ) {
	const dispatch = useDispatch();

	const [ targetUrl, setTargetUrl ] = useState( '' );
	const [ mode, setMode ] = useState< AmplifyMode | null >( null );

	const handleTargetChange = useCallback( ( url: string ) => setTargetUrl( url ), [] );

	const mutation = useStartAmplifyAnalysis( {
		onSuccess: () => {
			dispatch(
				successNotice( __( 'Analysis started. Your report will appear here when it’s ready.' ), {
					id: 'amplify-analysis-started',
					duration: 5000,
				} )
			);
			onClose();
		},
		onError: () => {
			dispatch(
				errorNotice( __( 'Could not start the analysis. Please try again.' ), {
					id: 'amplify-analysis-error',
					duration: 8000,
				} )
			);
		},
	} );

	const handleSubmit = () => {
		if ( ! targetUrl || ! mode ) {
			return;
		}
		dispatch( recordTracksEvent( 'calypso_a4a_amplify_start_analysis_click', { mode } ) );
		mutation.mutate( { url: targetUrl, mode } );
	};

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

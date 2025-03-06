import { useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import type { Step } from '../../types';

const AISiteBuilderProcessing: Step = function AISiteBuilderProcessing( { navigation } ) {
	const { setPendingAction, setProgress, setProgressTitle } = useDispatch( ONBOARD_STORE );

	useEffect( () => {
		const buildSite = async () => {
			setProgress( 0 );
			setProgressTitle( 'Initializing AI site builder...' );

			// Here we can access the auth token and make API calls
			// The token is automatically handled by the framework after login

			try {
				setProgressTitle( 'Analyzing your requirements...' );
				await new Promise( ( resolve ) => setTimeout( resolve, 2000 ) ); // Simulate work
				setProgress( 20 );

				setProgressTitle( 'Generating site content...' );
				await new Promise( ( resolve ) => setTimeout( resolve, 2000 ) ); // Simulate work
				setProgress( 40 );

				setProgressTitle( 'Creating pages...' );
				await new Promise( ( resolve ) => setTimeout( resolve, 2000 ) ); // Simulate work
				setProgress( 60 );

				setProgressTitle( 'Applying design...' );
				await new Promise( ( resolve ) => setTimeout( resolve, 2000 ) ); // Simulate work
				setProgress( 80 );

				setProgressTitle( 'Finalizing your site...' );
				await new Promise( ( resolve ) => setTimeout( resolve, 2000 ) ); // Simulate work
				setProgress( 100 );

				// Navigate to the next step or complete the flow
				navigation.submit?.();
			} catch ( error ) {
				console.error( 'Error building site:', error );
				// Handle error case
			}
		};

		setPendingAction( buildSite );
	}, [ setPendingAction, setProgress, setProgressTitle, navigation ] );

	return null;
};

export default AISiteBuilderProcessing;

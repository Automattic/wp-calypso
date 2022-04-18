import { useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { ReactElement, useEffect, useState } from 'react';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { useInterval } from 'calypso/lib/interval';
import type { Step } from '../../types';
import './style.scss';

const ProcessingStep: Step = function ( props ): ReactElement | null {
	const { submit } = props.navigation;

	const { __ } = useI18n();
	const loadingMessages = [
		{ title: __( 'Laying the foundations' ), duration: 2000 },
		{ title: __( 'Turning on the lights' ), duration: 3000 },
		{ title: __( 'Making it beautiful' ), duration: 2000 },
		{ title: __( 'Personalizing your site' ), duration: 4000 },
		{ title: __( 'Sprinkling some magic' ), duration: 4000 },
		{ title: __( 'Securing your data' ), duration: 5000 },
		{ title: __( 'Enabling encryption' ), duration: 3000 },
		{ title: __( 'Optimizing your content' ), duration: 6000 },
		{ title: __( 'Applying a shiny top coat' ), duration: 4000 },
		{ title: __( 'Closing the loop' ), duration: 5000 },
	];

	const action = useSelect( ( select ) => select( ONBOARD_STORE ).getPendingAction() );

	if ( ! action ) {
		// Nothing to process
		submit?.();
	}

	useEffect( () => {
		action?.then( () => {
			submit?.();
		} );
	}, [ action ] );

	const [ currentMessage, setCurrentMessage ] = useState( 0 );

	useInterval( () => {
		setCurrentMessage( ( s ) => ( s + 1 ) % loadingMessages.length );
	}, loadingMessages[ currentMessage ]?.duration );

	return (
		<div className={ 'processing-step' }>
			<h1 className="processing-step__progress-step">
				{ loadingMessages[ currentMessage ]?.title }
			</h1>
			<LoadingEllipsis />
		</div>
	);
};

export default ProcessingStep;

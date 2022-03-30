import { useI18n } from '@wordpress/react-i18n';
import { useRef, useState } from 'react';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { useInterval } from 'calypso/lib/interval/use-interval';
import './style.scss';

const useSteps = () => {
	const { __ } = useI18n();
	const steps = [
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

	return useRef( steps.filter( Boolean ) );
};

export default function ProcessingScreen() {
	const steps = useSteps();
	const [ currentStep, setCurrentStep ] = useState( 0 );

	useInterval( () => {
		setCurrentStep( ( s ) => ( s + 1 ) % steps.current.length );
	}, steps.current[ currentStep ]?.duration );

	return (
		<div className={ 'processing-screen' }>
			<h1 className="processing-screen__progress-step">{ steps.current[ currentStep ]?.title }</h1>
			<LoadingEllipsis />
		</div>
	);
}

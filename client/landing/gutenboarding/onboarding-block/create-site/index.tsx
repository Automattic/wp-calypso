/**
 * External dependencies
 */
import * as React from 'react';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@automattic/react-i18n';
import { Icon } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useInterval } from '../../../../lib/interval/use-interval';

/**
 * Internal dependencies
 */
import CreateAndRedirect from './create-and-redirect';
import { useNewQueryParam } from '../../path';
import { useTrackStep } from '../../hooks/use-track-step';
import { STORE_KEY } from '../../stores/onboard';
import './style.scss';

// Total time to perform "loading"
const DURATION_IN_MS = 6000;

/* eslint-disable wpcalypso/jsx-classname-namespace */
const CreateSite: React.FunctionComponent = () => {
	const { __ } = useI18n();
	const shouldTriggerCreate = useNewQueryParam();
	const [ shouldCreateAndRedirect, setCreateAndRedirect ] = React.useState( false );
	const hasPaidDomain = useSelect( ( select ) => select( STORE_KEY ).hasPaidDomain() );

	const steps = React.useRef< string[] >(
		[
			__( 'Building your site' ),
			hasPaidDomain && __( 'Getting your domain' ),
			__( 'Applying design' ),
		].filter( Boolean ) as string[]
	);
	const totalSteps = steps.current.length;

	const [ currentStep, setCurrentStep ] = React.useState( 0 );

	/**
	 * Completion progress: 0 <= progress <= 1
	 */
	const progress = ( currentStep + 1 ) / totalSteps;
	const isComplete = progress >= 1;

	useInterval(
		() => setCurrentStep( ( s ) => s + 1 ),
		// Enable the interval when progress is incomplete
		isComplete ? null : DURATION_IN_MS / totalSteps
	);

	React.useEffect( () => {
		if ( isComplete ) {
			setCreateAndRedirect( true );
		}
	}, [ isComplete ] );

	useTrackStep( 'CreateSite' );

	// Force animated progress bar to start at 0
	const [ hasStarted, setHasStarted ] = React.useState( false );
	React.useEffect( () => {
		const id = setTimeout( () => setHasStarted( true ), 750 );
		return () => clearTimeout( id );
	}, [] );

	return (
		<div className="gutenboarding-page create-site__background">
			{ shouldTriggerCreate && shouldCreateAndRedirect && <CreateAndRedirect /> }
			<div className="create-site__layout">
				<div className="create-site__header">
					<div className="gutenboarding__header-wp-logo">
						<Icon icon="wordpress-alt" size={ 24 } />
					</div>
				</div>
				<div className="create-site__content">
					<div className="create-site__progress">
						<div className="create-site__progress-steps">
							<div className="create-site__progress-step">{ steps.current[ currentStep ] }</div>
						</div>
					</div>
					<div
						className="create-site__progress-bar"
						style={
							{
								'--progress': ! hasStarted ? /* initial 10% progress */ 0.1 : progress,
							} as React.CSSProperties
						}
					/>
					<div className="create-site__progress-numbered-steps">
						<p>
							{
								// translators: these are progress steps. Eg: step 1 of 4.
								sprintf( __( 'Step %(currentStep)d of %(totalSteps)d' ), {
									currentStep: currentStep + 1,
									totalSteps,
								} )
							}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CreateSite;

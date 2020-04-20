/**
 * External dependencies
 */
import * as React from 'react';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@automattic/react-i18n';
import { Icon } from '@wordpress/components';

/**
 * Internal dependencies
 */
import CreateAndRedirect from './create-and-redirect';
import { useNewQueryParam } from '../../path';
import { useTrackStep } from '../../hooks/use-track-step';
import './style.scss';

// Total time to perform "loading"
const DURATION_IN_MS = 12000;

/* eslint-disable wpcalypso/jsx-classname-namespace */
const CreateSite: React.FunctionComponent = () => {
	const { __ } = useI18n();
	const shouldTriggerCreate = useNewQueryParam();
	const [ shouldCreateAndRedirect, setCreateAndRedirect ] = React.useState( false );

	// Some very rudimentary progress illusions

	const progressSteps = React.useRef( [
		__( 'Building your site' ),
		__( 'Getting your domain' ),
		__( 'Applying design' ),
	] );

	const [ step, setStep ] = React.useState< number >( 0 );
	const [ progress, setProgress ] = React.useState< number >( 0 );

	// Give an initial progress indication…
	React.useEffect( () => setProgress( 7 ), [] );

	React.useEffect( () => {
		const totalSteps = progressSteps.current.length;
		const maxIndex = totalSteps - 1;
		if ( step >= maxIndex && progress >= 100 ) {
			setCreateAndRedirect( true );
		}
		const timeoutId = window.setTimeout( () => {
			setStep( Math.min( step + 1, maxIndex ) );
			setProgress( Math.min( ( ( step + 1 ) / totalSteps ) * 100, 100 ) );
		}, DURATION_IN_MS / totalSteps );
		return () => window.clearTimeout( timeoutId );
	}, [ progress, step ] );

	useTrackStep( 'CreateSite' );

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
							<div className="create-site__progress-step">{ progressSteps.current[ step ] }</div>
						</div>
					</div>
					<div
						className="create-site__progress-bar"
						style={
							{
								'--progress': progress,
							} as React.CSSProperties
						}
					/>
					<div className="create-site__progress-numbered-steps">
						<p>
							{
								// translators: these are progress steps. Eg: step 1 of 4.
								sprintf( __( 'Step %(currentStep)d of %(totalSteps)d' ), {
									currentStep: step + 1,
									totalSteps: progressSteps.current.length,
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

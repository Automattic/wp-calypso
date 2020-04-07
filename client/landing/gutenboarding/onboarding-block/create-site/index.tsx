/**
 * External dependencies
 */
import React, { FunctionComponent, useEffect } from 'react';
import { useI18n } from '@automattic/react-i18n';
import { Icon } from '@wordpress/components';

/**
 * Internal dependencies
 */
import CreateAndRedirect from './create-and-redirect';
import { useNewQueryParam } from '../../path';
import './style.scss';
/**
 * Internal dependencies
 */
import { ProgressBar } from '@automattic/components';

const CREATE_SITE_PROGRESS_TOTAL = 100;
const CREATE_SITE_PROGRESS_INTERVAL = 2000;

/* eslint-disable wpcalypso/jsx-classname-namespace */
const CreateSite: FunctionComponent< {} > = () => {
	const { __: NO__ } = useI18n();
	const shouldTriggerCreate = useNewQueryParam();
	const [ shouldCreateAndRedirect, setCreateAndRedirect ] = React.useState( false );

	// Some very rudimentary progress illusions
	const [ currentStepIndex, setCurentStepIndex ] = React.useState( 0 );
	const progressSteps = [
		{
			title: NO__( 'Building your site' ),
		},
		{
			title: NO__( 'Getting your domain' ),
		},
		{
			title: NO__( 'Applying design' ),
		},
	];
	const progressStepFactor = CREATE_SITE_PROGRESS_TOTAL / progressSteps.length;
	const progressBarValue = ( currentStepIndex + 1 ) * progressStepFactor;

	useEffect( () => {
		const isProgressComplete = currentStepIndex >= progressSteps.length - 1;
		if ( ! isProgressComplete ) {
			setTimeout( () => {
				setCurentStepIndex( currentStepIndex + 1 );
			}, CREATE_SITE_PROGRESS_INTERVAL );
		}

		if ( shouldTriggerCreate && isProgressComplete ) {
			setCreateAndRedirect( true );
		}
	}, [ currentStepIndex ] );

	return (
		<div className="create-site__background">
			{ shouldCreateAndRedirect && <CreateAndRedirect /> }
			<div className="create-site__layout">
				<div className="create-site__header">
					<div className="gutenboarding__header-wp-logo">
						<Icon icon="wordpress-alt" size={ 24 } />
					</div>
				</div>
				<div className="create-site__content">
					<h1 className="create-site__title">{ progressSteps[ currentStepIndex ].title }</h1>
					<div className="create-site__progress">
						<ProgressBar value={ progressBarValue } total={ CREATE_SITE_PROGRESS_TOTAL } />
					</div>
					{ /* TODO: interpolate this test in an i18n method with step count args */ }
					<p className="create-site__progress-text">
						{ `Step ${ currentStepIndex + 1 } of ${ progressSteps.length }` }
					</p>
				</div>
			</div>
		</div>
	);
};

export default CreateSite;

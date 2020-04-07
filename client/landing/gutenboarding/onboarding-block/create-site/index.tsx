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

/* eslint-disable wpcalypso/jsx-classname-namespace */
const CreateSite: FunctionComponent< {} > = () => {
	const { __: NO__ } = useI18n();
	const shouldTriggerCreate = useNewQueryParam();
	const progressTotal = 100;
	const progressStepCount = 3;
	const [ progressComplete, setProgressComplete ] = React.useState( 0 );
	const [ shouldCreateAndRedirect, setCreateAndRedirect ] = React.useState( false );

	useEffect( () => {
		if ( progressComplete < progressTotal ) {
			setTimeout( () => {
				const progressFactor = progressTotal / progressStepCount;
				setProgressComplete( progressComplete + progressFactor );
			}, 2000 );
		}

		if ( progressComplete >= progressTotal ) {
			setCreateAndRedirect( true );
		}
	}, [ progressComplete, shouldTriggerCreate ] );

	return (
		<div className="create-site__background">
			{ /* TODO: uncomment this after dev work :) */ }
			{ shouldCreateAndRedirect ? <CreateAndRedirect /> : null }
			<div className="create-site__layout">
				<div className="create-site__header">
					<div className="gutenboarding__header-wp-logo">
						<Icon icon="wordpress-alt" size={ 24 } />
					</div>
				</div>
				<div className="create-site__content">
					<h1 className="create-site__title">{ NO__( 'Building your site' ) }</h1>
					<div className="create-site__progress">
						<ProgressBar value={ progressComplete } total={ progressTotal } />
					</div>
					{ /* TODO: interpolate this test with step count args */ }
					<p className="create-site__progress-text">{ NO__( 'Step 1 of 3' ) }</p>
				</div>
			</div>
		</div>
	);
};

export default CreateSite;

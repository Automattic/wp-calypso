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
const CREATE_SITE_PROGRESS_STEP_COUNT = 3;
const CREATE_SITE_PROGRESS_INTERVAL = 2000;

/* eslint-disable wpcalypso/jsx-classname-namespace */
const CreateSite: FunctionComponent< {} > = () => {
	const { __: NO__ } = useI18n();
	const shouldTriggerCreate = useNewQueryParam();
	const [ progressComplete, setProgressComplete ] = React.useState( 0 );
	const [ shouldCreateAndRedirect, setCreateAndRedirect ] = React.useState( false );

	useEffect( () => {
		if ( progressComplete < CREATE_SITE_PROGRESS_TOTAL ) {
			setTimeout( () => {
				const progressFactor = CREATE_SITE_PROGRESS_TOTAL / CREATE_SITE_PROGRESS_STEP_COUNT;
				setProgressComplete( progressComplete + progressFactor );
			}, CREATE_SITE_PROGRESS_INTERVAL );
		}

		if ( shouldTriggerCreate && progressComplete >= CREATE_SITE_PROGRESS_TOTAL ) {
			setCreateAndRedirect( true );
		}
	}, [ progressComplete ] );

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
					<h1 className="create-site__title">{ NO__( 'Building your site' ) }</h1>
					<div className="create-site__progress">
						<ProgressBar value={ progressComplete } total={ CREATE_SITE_PROGRESS_TOTAL } />
					</div>
					{ /* TODO: interpolate this test with step count args */ }
					<p className="create-site__progress-text">{ NO__( 'Step 1 of 3' ) }</p>
				</div>
			</div>
		</div>
	);
};

export default CreateSite;

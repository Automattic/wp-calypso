/**
 * WordPress dependencies
 */
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import DonationsTabs from './donations-tabs';
import LoadingError from './loading-error';
import LoadingStatus from './loading-status';
import UpgradePlan from './upgrade-plan';
import fetchStatus from './fetch-status';

const Edit = () => {
	const [ isLoading, setIsLoading ] = useState( true );
	const [ loadingError, setLoadingError ] = useState( '' );
	const [ shouldUpgrade, setShouldUpgrade ] = useState( false );
	const [ upgradeUrl, setUpgradeUrl ] = useState( '' );

	const mapStatusToState = ( result ) => {
		if ( ( ! result && typeof result !== 'object' ) || result.errors ) {
			setLoadingError( __( 'Could not load data from WordPress.com.', 'full-site-editing' ) );
		} else {
			setShouldUpgrade( result.should_upgrade_to_access_memberships );
			setUpgradeUrl( result.upgrade_url );
		}

		setIsLoading( false );
	};

	const apiError = ( message ) => {
		setLoadingError( message );
		setIsLoading( false );
	};

	useEffect( () => {
		const updateData = () => fetchStatus().then( mapStatusToState, apiError );
		updateData();
	}, [] );

	if ( isLoading ) {
		return <LoadingStatus />;
	}

	if ( loadingError ) {
		return <LoadingError error={ loadingError } />;
	}

	if ( shouldUpgrade ) {
		return <UpgradePlan upgradeUrl={ upgradeUrl } />;
	}

	return <DonationsTabs />;
};

export default Edit;

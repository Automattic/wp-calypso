/**
 * WordPress dependencies
 */
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Donations from './donations';
import LoadingError from './loading-error';
import LoadingStatus from './loading-status';
import UpgradePlan from './upgrade-plan';
import fetchDefaultProducts from './fetch-default-products';
import fetchStatus from './fetch-status';

const Edit = () => {
	const [ isLoading, setIsLoading ] = useState( true );
	const [ loadingError, setLoadingError ] = useState( '' );
	const [ shouldUpgrade, setShouldUpgrade ] = useState( false );
	const [ stripeConnectUrl, setStripeConnectUrl ] = useState( false );
	const [ products, setProducts ] = useState( [] );
	const [ upgradeUrl, setUpgradeUrl ] = useState( '' );

	const apiError = ( message ) => {
		setLoadingError( message );
		setIsLoading( false );
	};

	const hasRequiredProducts = ( productList, productCurrency ) => {
		const productIntervals = productList.reduce( ( intervals, { currency, type, interval } ) => {
			if ( currency === productCurrency && type === 'donation' ) {
				intervals.push( interval );
			}
			return intervals;
		}, [] );

		return (
			productIntervals.includes( 'one-time' ) &&
			productIntervals.includes( '1 month' ) &&
			productIntervals.includes( '1 year' )
		);
	};

	const mapStatusToState = ( result ) => {
		if ( ( ! result && typeof result !== 'object' ) || result.errors ) {
			setLoadingError( __( 'Could not load data from WordPress.com.', 'full-site-editing' ) );
		} else {
			setShouldUpgrade( result.should_upgrade_to_access_memberships );
			setUpgradeUrl( result.upgrade_url );
			setStripeConnectUrl( result.connect_url );

			if ( result.products.length && hasRequiredProducts( result.products, 'USD' ) ) {
				setProducts( result.products );
			} else {
				fetchDefaultProducts( 'USD' ).then(
					( defaultProducts ) => setProducts( defaultProducts ),
					apiError
				);
			}
		}

		setIsLoading( false );
	};

	useEffect( () => {
		const updateData = () => fetchStatus( 'donation' ).then( mapStatusToState, apiError );
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

	return <Donations stripeConnectUrl={ stripeConnectUrl } products={ products } />;
};

export default Edit;

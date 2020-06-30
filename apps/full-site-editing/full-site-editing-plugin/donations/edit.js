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

const Edit = ( { attributes, setAttributes } ) => {
	const [ isLoading, setIsLoading ] = useState( true );
	const [ loadingError, setLoadingError ] = useState( '' );
	const [ shouldUpgrade, setShouldUpgrade ] = useState( false );
	const [ stripeConnectUrl, setStripeConnectUrl ] = useState( false );
	const [ products, setProducts ] = useState( [] );
	const [ upgradeUrl, setUpgradeUrl ] = useState( '' );
	const [ siteSlug, setSiteSlug ] = useState( '' );

	const apiError = ( message ) => {
		setLoadingError( message );
		setIsLoading( false );
	};

	const filterProducts = ( productList, productCurrency ) => {
		return productList.reduce( ( filteredProducts, { id, currency, type, interval } ) => {
			if ( currency === productCurrency && type === 'donation' ) {
				filteredProducts[ interval ] = id;
			}
			return filteredProducts;
		}, {} );
	};

	const hasRequiredProducts = ( productIdsPerInterval ) => {
		const intervals = Object.keys( productIdsPerInterval );

		return (
			intervals.includes( 'one-time' ) &&
			intervals.includes( '1 month' ) &&
			intervals.includes( '1 year' )
		);
	};

	const mapStatusToState = ( result ) => {
		if ( ( ! result && typeof result !== 'object' ) || result.errors ) {
			setLoadingError( __( 'Could not load data from WordPress.com.', 'full-site-editing' ) );
		} else {
			setShouldUpgrade( result.should_upgrade_to_access_memberships );
			setUpgradeUrl( result.upgrade_url );
			setStripeConnectUrl( result.connect_url );
			setSiteSlug( result.site_slug );

			const filteredProducts = filterProducts( result.products, 'USD' );

			if ( hasRequiredProducts( filteredProducts ) ) {
				setProducts( filteredProducts );
			} else {
				fetchDefaultProducts( 'USD' ).then(
					( defaultProducts ) => setProducts( filterProducts( defaultProducts, 'USD' ) ),
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

	return (
		<Donations
			attributes={ attributes }
			products={ products }
			stripeConnectUrl={ stripeConnectUrl }
			setAttributes={ setAttributes }
			siteSlug={ siteSlug }
		/>
	);
};

export default Edit;

/**
 * WordPress dependencies
 */
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Tabs from './tabs';
import LoadingError from './loading-error';
import LoadingStatus from './loading-status';
import UpgradePlan from './upgrade-plan';
import fetchDefaultProducts from './fetch-default-products';
import fetchStatus from './fetch-status';

const Edit = ( props ) => {
	const { attributes } = props;
	const { currency } = attributes;

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

	const filterProducts = ( productList ) =>
		productList.reduce( ( filteredProducts, { id, currency: productCurrency, type, interval } ) => {
			if ( productCurrency === currency && type === 'donation' ) {
				filteredProducts[ interval ] = id;
			}
			return filteredProducts;
		}, {} );

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

			const filteredProducts = filterProducts( result.products );

			if ( hasRequiredProducts( filteredProducts ) ) {
				setProducts( filteredProducts );
			} else {
				fetchDefaultProducts( currency ).then(
					( defaultProducts ) => setProducts( filterProducts( defaultProducts ) ),
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
		<Tabs
			{ ...props }
			products={ products }
			stripeConnectUrl={ stripeConnectUrl }
			siteSlug={ siteSlug }
		/>
	);
};

export default Edit;

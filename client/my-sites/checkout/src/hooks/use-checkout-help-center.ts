import { recordTracksEvent } from '@automattic/calypso-analytics';
import { HelpCenter, HelpCenterSelect } from '@automattic/data-stores';
import {
	useProductsCustomOptions,
	useProductsWithPremiumSupport,
} from '@automattic/help-center/src/hooks';
import { useShoppingCart } from '@automattic/shopping-cart';
import {
	useDispatch as useDataStoreDispatch,
	useSelect as useDataStoreSelect,
} from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { useEffect } from 'react';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const HELP_CENTER_STORE = HelpCenter.register();

export const useCheckoutHelpCenter = () => {
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );

	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );

	const {
		hasPremiumSupport,
		userFieldMessage,
		userFieldFlowName,
		helpCenterButtonCopy,
		helpCenterButtonLink,
	} = useProductsWithPremiumSupport( responseCart.products, 'checkout' );
	const helpCenterOptions = useProductsCustomOptions( responseCart.products );

	const { setShowHelpCenter, setNavigateToRoute } = useDataStoreDispatch( HELP_CENTER_STORE );

	const isShowingHelpCenter = useDataStoreSelect(
		( select ) => ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).isHelpCenterShown(),
		[]
	);
	const toggleHelpCenter = () => {
		recordTracksEvent( `calypso_thank_you_inlinehelp_${ isShowingHelpCenter ? 'close' : 'show' }`, {
			force_site_id: true,
			location: 'thank-you-help-center',
		} );

		if ( hasPremiumSupport ) {
			setShowHelpCenter( ! isShowingHelpCenter, hasPremiumSupport, helpCenterOptions );
			const urlWithQueryArgs = addQueryArgs( '/odie?provider=zendesk', {
				userFieldMessage,
				userFieldFlowName,
				siteUrl: siteSlug,
				siteId,
			} );
			setNavigateToRoute( urlWithQueryArgs );
		} else {
			setShowHelpCenter( ! isShowingHelpCenter, hasPremiumSupport );
		}
	};

	useEffect( () => {
		return () => {
			setShowHelpCenter( false );
		};
	}, [] );

	return {
		toggleHelpCenter,
		helpCenterButtonCopy,
		helpCenterButtonLink,
	};
};

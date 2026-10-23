import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { isAkismetProduct, isJetpackPurchasableItem } from '@automattic/calypso-products';
import { HelpCenter, HelpCenterSelect } from '@automattic/data-stores';
import {
	useProductsCustomOptions,
	useProductsWithPremiumSupport,
} from '@automattic/help-center/src/hooks';
import { ONBOARDING_FLOW } from '@automattic/onboarding';
import { useShoppingCart } from '@automattic/shopping-cart';
import {
	useDispatch as useDataStoreDispatch,
	useSelect as useDataStoreSelect,
} from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef } from 'react';
import { useExperiment } from 'calypso/lib/explat';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSectionName, getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { loadCheckoutSupportVariation } from '../lib/checkout-support-routing';

const HELP_CENTER_STORE = HelpCenter.register();

// Checkouts for other brands, which the checkout support experiment leaves out.
const OTHER_BRAND_CHECKOUT_PATHS = [
	'/checkout/jetpack',
	'/checkout/akismet',
	'/checkout/agency',
	'/checkout/marketplace',
	'/checkout/passport',
];

const isOtherBrandCheckoutPath = ( pathname: string ) =>
	OTHER_BRAND_CHECKOUT_PATHS.some(
		( path ) => pathname === path || pathname.startsWith( `${ path }/` )
	);

// Renewals of other brands go through /checkout/renew/:subscriptionId with no site selected,
// so only the cart tells them apart.
const isOtherBrandCart = ( products: { product_slug: string }[] ) =>
	products.length > 0 &&
	products.every(
		( product ) =>
			isJetpackPurchasableItem( product.product_slug, { includeLegacy: true } ) ||
			isAkismetProduct( product )
	);

// Checkout has no admin bar node to read the arm from, so it asks ExPlat itself.
const GET_HELP_EXPERIMENT = 'calypso_help_center_get_help_chat_forward';

export const useCheckoutHelpCenter = (): {
	toggleHelpCenter: () => void;
	helpCenterButtonCopy?: string;
	helpCenterButtonLink: string;
	showHelpIcon: boolean;
} => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const isLoggedIn = useSelector( isUserLoggedIn );
	const sectionName = useSelector( getSectionName );
	const isJetpackNotAtomic = useSelector(
		( state ) => !! siteId && !! isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId )
	);

	const cartKey = useCartKey();
	const {
		responseCart,
		isLoading: isCartLoading,
		isPendingUpdate: isCartUpdating,
	} = useShoppingCart( cartKey );

	const {
		hasPremiumSupport,
		userFieldMessage,
		userFieldFlowName,
		helpCenterButtonCopy,
		helpCenterButtonLink,
	} = useProductsWithPremiumSupport( responseCart.products, 'checkout' );
	const helpCenterOptions = useProductsCustomOptions( responseCart.products );

	// Only the WordPress.com checkout itself is in the checkout support experiment: not the pending
	// and thank-you pages, which share this hook, not checkouts for other brands, whose buyers
	// shouldn't be sent to WordPress.com support, and not carts that already go straight to a human.
	// Both of those read the cart, so nobody joins until it's ready: a renewal's cart is empty
	// until its product is added.
	const isOtherBrandCheckout =
		isJetpackNotAtomic ||
		isOtherBrandCheckoutPath( window.location.pathname ) ||
		isOtherBrandCart( responseCart.products );
	const canJoinCheckoutSupportExperiment =
		config.isEnabled( 'checkout/support-routing' ) &&
		sectionName === 'checkout' &&
		isLoggedIn &&
		! isCartLoading &&
		! isCartUpdating &&
		responseCart.products.length > 0 &&
		! isOtherBrandCheckout &&
		! hasPremiumSupport;

	const [ , experimentAssignment ] = useExperiment( GET_HELP_EXPERIMENT );
	const isGetHelpTreatment = experimentAssignment?.variationName === 'treatment';

	const { setShowHelpCenter, setNavigateToRoute, setIsMinimized } =
		useDataStoreDispatch( HELP_CENTER_STORE );

	const { isShowingHelpCenter, isMinimized, currentCheckoutSupportVariation } = useDataStoreSelect(
		( select ) => {
			const helpCenterSelect = select( HELP_CENTER_STORE ) as HelpCenterSelect;
			return {
				isShowingHelpCenter: helpCenterSelect.isHelpCenterShown(),
				isMinimized: helpCenterSelect.getIsMinimized(),
				currentCheckoutSupportVariation: helpCenterSelect.getCheckoutSupportVariation(),
			};
		},
		[]
	);

	// Counts toggles, plus one when checkout unmounts. An open that waited for the assignment
	// only goes ahead if nothing changed meanwhile: not another click, and not leaving checkout.
	// The checkout top bar can stay mounted when paying moves on to the pending page, so the
	// page path is checked too.
	const toggleCountRef = useRef( 0 );
	useEffect( () => {
		const toggleCount = toggleCountRef;
		return () => {
			toggleCount.current++;
		};
	}, [] );

	const toggleHelpCenter = async () => {
		const toggle = ++toggleCountRef.current;
		const pathname = window.location.pathname;

		recordTracksEvent( `calypso_thank_you_inlinehelp_${ isShowingHelpCenter ? 'close' : 'show' }`, {
			force_site_id: true,
			location: 'thank-you-help-center',
		} );

		// Unified onboarding help-adoption signal, tagged by step. Only in the
		// onboarding-flow checkout and only when opening (matches the domains,
		// use-my-domain and plans steps).
		if ( ! isShowingHelpCenter ) {
			const flow = new URLSearchParams( window.location.search ).get( 'flow' );
			if ( flow === ONBOARDING_FLOW ) {
				recordTracksEvent( 'calypso_onboarding_help_center_click', { flow, step: 'checkout' } );
			}
		}

		// A minimized Help Center still counts as shown. When checkout support minimized it, bring it
		// back as it was, like the Help Center's own header does, so a human chat keeps its route.
		// Otherwise, bringing it back is a new opening from checkout.
		if ( isMinimized && currentCheckoutSupportVariation ) {
			setIsMinimized( false );
			return;
		}
		const isOpening = ! isShowingHelpCenter || isMinimized;

		// Assign the variation only when opening, so only people who ask for help are in the experiment.
		const checkoutSupportVariation =
			isOpening && canJoinCheckoutSupportExperiment
				? await loadCheckoutSupportVariation()
				: undefined;
		if ( toggle !== toggleCountRef.current || window.location.pathname !== pathname ) {
			return;
		}

		setShowHelpCenter( isOpening, {
			hasPremiumSupport,
			...helpCenterOptions,
			checkoutSupportVariation,
		} );
		if ( hasPremiumSupport ) {
			const urlWithQueryArgs = addQueryArgs( '/odie?provider=zendesk', {
				userFieldMessage,
				userFieldFlowName,
				siteUrl: siteSlug,
				siteId,
			} );
			setNavigateToRoute( urlWithQueryArgs );
		} else if ( checkoutSupportVariation === 'human_only' ) {
			// The variation grants premium support, so users without a paid plan reach a human too.
			setNavigateToRoute(
				addQueryArgs( '/odie?provider=zendesk', {
					siteUrl: siteSlug ?? undefined,
					siteId: siteId ?? undefined,
				} )
			);
		} else {
			setNavigateToRoute( '/odie' );
		}
	};

	return {
		toggleHelpCenter,
		helpCenterButtonCopy,
		helpCenterButtonLink: isGetHelpTreatment
			? String( translate( 'Get Help' ) )
			: helpCenterButtonLink,
		showHelpIcon: isGetHelpTreatment,
	};
};

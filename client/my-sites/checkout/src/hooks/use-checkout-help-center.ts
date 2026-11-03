import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import {
	isDomainProduct,
	isDomainTransfer,
	isGSuiteOrGoogleWorkspace,
	isTitanMail,
	isWpComPlan,
} from '@automattic/calypso-products';
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
import { loadCheckoutSupportAssignment } from '../lib/checkout-support-routing';

const HELP_CENTER_STORE = HelpCenter.register();

// Agencies buy WordPress.com plans too, sometimes for a WordPress.com site, but have support of
// their own.
const isAgencyCheckoutPath = ( pathname: string ) =>
	pathname === '/checkout/agency' || pathname.startsWith( '/checkout/agency/' );

// Renewals and domain-only purchases have no site selected, so only the cart shows they're
// WordPress.com purchases.
const isWordPressComCart = (
	products: { product_slug: string; is_domain_registration?: boolean }[]
) =>
	products.length > 0 &&
	products.every(
		( product ) =>
			isWpComPlan( product.product_slug ) ||
			isDomainProduct( product ) ||
			isDomainTransfer( product ) ||
			isGSuiteOrGoogleWorkspace( product ) ||
			isTitanMail( product )
	);

// Checkout has no admin bar node to read the arm from, so it asks ExPlat itself.
const GET_HELP_EXPERIMENT = 'calypso_help_center_get_help_chat_forward';

const getCartType = ( products: { is_renewal?: boolean }[] ) => {
	const renewalCount = products.filter( ( product ) => product.is_renewal ).length;
	if ( ! products.length ) {
		return 'empty';
	}
	if ( renewalCount === products.length ) {
		return 'renewal';
	}
	return renewalCount ? 'mixed' : 'new_purchase';
};

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
	// Atomic sites are Jetpack sites too, but hosted on WordPress.com.
	const isWordPressComSite = useSelector(
		( state ) =>
			!! siteId && ( ! isJetpackSite( state, siteId ) || !! isAtomicSite( state, siteId ) )
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
	// and thank-you pages, which share this hook, not carts that already go straight to a human,
	// and not any checkout that isn't recognizably WordPress.com, since its buyers shouldn't be sent
	// to WordPress.com support. Both checks read the cart, so nobody joins until it's ready: a
	// renewal's cart is empty until its product is added.
	const isWordPressComCheckout =
		! isAgencyCheckoutPath( window.location.pathname ) &&
		( isWordPressComSite || ( ! siteId && isWordPressComCart( responseCart.products ) ) );
	const canJoinCheckoutSupportExperiment =
		config.isEnabled( 'checkout/support-routing' ) &&
		sectionName === 'checkout' &&
		isLoggedIn &&
		! isCartLoading &&
		! isCartUpdating &&
		responseCart.products.length > 0 &&
		isWordPressComCheckout &&
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
		// A minimized Help Center still counts as shown, but clicking brings it back.
		const isOpening = ! isShowingHelpCenter || isMinimized;

		recordTracksEvent( `calypso_thank_you_inlinehelp_${ isOpening ? 'show' : 'close' }`, {
			force_site_id: true,
			location: 'thank-you-help-center',
		} );

		// Unified onboarding help-adoption signal, tagged by step. Only in the
		// onboarding-flow checkout and only when opening (matches the domains,
		// use-my-domain and plans steps).
		if ( isOpening ) {
			const flow = new URLSearchParams( window.location.search ).get( 'flow' );
			if ( flow === ONBOARDING_FLOW ) {
				recordTracksEvent( 'calypso_onboarding_help_center_click', { flow, step: 'checkout' } );
			}
		}

		// When checkout support minimized it, bring it back as it was, like the Help Center's own
		// header does, so a human chat keeps its route. Otherwise, bringing it back is a new opening
		// from checkout.
		if ( isMinimized && currentCheckoutSupportVariation ) {
			setIsMinimized( false );
			return;
		}

		// Assign the variation only when opening, so only people who ask for help are in the experiment.
		const assignment =
			isOpening && canJoinCheckoutSupportExperiment
				? await loadCheckoutSupportAssignment()
				: undefined;
		const checkoutSupportVariation = assignment?.variation;
		if ( toggle !== toggleCountRef.current || window.location.pathname !== pathname ) {
			return;
		}

		// Someone opening support from checkout itself, for the checkout support experiment's
		// readout. Bringing back a minimized chat isn't a new opening, so it has returned already.
		if ( isOpening && sectionName === 'checkout' ) {
			recordTracksEvent( 'calypso_checkout_support_open', {
				...( checkoutSupportVariation && {
					checkout_support_variation: checkoutSupportVariation,
				} ),
				can_join_experiment: canJoinCheckoutSupportExperiment,
				// Someone who waited too long got no variation, though ExPlat may still have assigned
				// one, so the readout leaves them out of every group.
				...( assignment && {
					assignment_timed_out: assignment.timedOut,
					assignment_ms: assignment.durationMs,
				} ),
				is_logged_in: isLoggedIn,
				cart_type: getCartType( responseCart.products ),
				has_premium_support: hasPremiumSupport,
			} );
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

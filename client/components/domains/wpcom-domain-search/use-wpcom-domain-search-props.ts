import { isEnabled } from '@automattic/calypso-config';
import { DomainSearch } from '@automattic/domain-search';
import {
	isDomainForGravatarFlow,
	isHundredYearDomainFlow,
	isHundredYearPlanFlow,
} from '@automattic/onboarding';
import { ResponseCartProduct } from '@automattic/shopping-cart';
import { useMemo, type ComponentProps, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	DOMAIN_BUNDLE_EXPERIMENT_NAME,
	DOMAIN_BUNDLE_EXPERIMENT_TREATMENT,
} from 'calypso/lib/domains/bundle-experiment';
import { loadExperimentAssignment } from 'calypso/lib/explat';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { mergeObjectFunctions } from '../../../lib/merge-object-functions';
import { recordDomainSearchStepSubmit } from './analytics';
import { useWPCOMDomainSearchCart } from './use-wpcom-domain-search-cart';
import { useWPCOMDomainSearchEvents } from './use-wpcom-domain-search-events';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

export type WPCOMDomainSearchProps = Omit<
	ComponentProps< typeof DomainSearch >,
	'cart' | 'events'
> & {
	currentSiteId?: number;
	flowName: string;
	events: Omit< Required< ComponentProps< typeof DomainSearch > >[ 'events' ], 'onContinue' > & {
		onContinue: ( items: ResponseCartProduct[] ) => void;
		beforeAddDomainToCart?: ( domain: MinimalRequestCartProduct ) => MinimalRequestCartProduct;
	};
	isFirstDomainFreeForFirstYear?: boolean;
	flowAllowsMultipleDomainsInCart: boolean;
	analyticsSection: string;
};

export const getCartKey = ( {
	isLoggedIn,
	currentSiteId,
}: {
	isLoggedIn: boolean;
	currentSiteId?: number;
} ) => {
	const sitelessCartKey = isLoggedIn ? 'no-site' : 'no-user';
	return currentSiteId ?? sitelessCartKey;
};

export const useWPCOMDomainSearchProps = ( {
	currentSiteId,
	flowName,
	isFirstDomainFreeForFirstYear = false,
	flowAllowsMultipleDomainsInCart,
	analyticsSection,
	query,
	config: externalConfig,
	events: externalEvents,
}: WPCOMDomainSearchProps ) => {
	const dispatch = useDispatch();
	const isLoggedIn = useSelector( isUserLoggedIn );

	const {
		onContinue: externalOnContinue,
		beforeAddDomainToCart: externalBeforeAddDomainToCart,
		...otherExternalEvents
	} = externalEvents;

	const onContinueWithStepSubmissionTracking = useCallback(
		( items: ResponseCartProduct[] ) => {
			const firstItem = items[ 0 ];
			dispatch( recordDomainSearchStepSubmit( { domain_name: firstItem.meta }, analyticsSection ) );
			externalOnContinue( items );
		},
		[ dispatch, analyticsSection, externalOnContinue ]
	);

	const { cart, isNextDomainFree, freeDomainName, onContinue } = useWPCOMDomainSearchCart( {
		cartKey: getCartKey( { isLoggedIn, currentSiteId } ),
		flowName,
		isFirstDomainFreeForFirstYear,
		flowAllowsMultipleDomainsInCart,
		onContinue: onContinueWithStepSubmissionTracking,
		beforeAddDomainToCart: externalBeforeAddDomainToCart,
	} );

	// Resolved once the user is assigned the bundle experiment's treatment arm at
	// the search would-show decision point (see onBundleWouldShow). The dev/staging
	// `domain-bundling` flag is OR'd in below, so this strictly tracks the
	// experiment. Sticky once true: a user who is shown a bundle stays in the
	// treatment experience for the rest of the session.
	const [ isBundleTreatment, setIsBundleTreatment ] = useState( false );

	// Fired by the package the moment a bundle card would render, for BOTH arms.
	// This is the experiment exposure: loadExperimentAssignment assigns/exposes
	// control and treatment identically, scoped to users who would have seen a
	// bundle. It dedupes internally, so calling it again on a later search is
	// harmless. Only treatment flips the render gate on.
	const onBundleWouldShow = useCallback( () => {
		loadExperimentAssignment( DOMAIN_BUNDLE_EXPERIMENT_NAME ).then( ( assignment ) => {
			if ( assignment.variationName === DOMAIN_BUNDLE_EXPERIMENT_TREATMENT ) {
				setIsBundleTreatment( true );
			}
		} );
	}, [] );

	const config = useMemo( () => {
		// Bundles are fixed one-year registrations of multiple TLDs, so they
		// don't fit flows that sell a single special-purpose registration —
		// and those flows' beforeAddDomainToCart transforms (100-year term,
		// Gravatar extras) are not applied to bundle members.
		const flowSupportsBundles =
			! isHundredYearPlanFlow( flowName ) &&
			! isHundredYearDomainFlow( flowName ) &&
			! isDomainForGravatarFlow( flowName );

		return {
			...externalConfig,
			// Fetch for BOTH arms wherever the flow is eligible — never gated on the
			// experiment — so control and treatment both reach the would-show
			// decision point. The server bundle kill switch still returns nothing
			// when bundles are off, so this fetches only when bundles can exist.
			showBundleSuggestions: flowSupportsBundles,
			// Render the card only for the dev/staging flag (force-on) or the
			// experiment treatment arm. Control fetches the suggestion but renders
			// nothing.
			showBundleCard:
				( isEnabled( 'domain-bundling' ) || isBundleTreatment ) && flowSupportsBundles,
			priceRules: {
				...externalConfig?.priceRules,
				freeForFirstYear: isNextDomainFree,
				// Keep the already-added free domain showing as $0 in the suggestion list,
				// matching what the user saw when they clicked and what appears in their cart.
				freeForFirstYearDomains: freeDomainName ? [ freeDomainName ] : undefined,
			},
		};
	}, [ externalConfig, isNextDomainFree, freeDomainName, flowName, isBundleTreatment ] );

	const analyticsEvents = useWPCOMDomainSearchEvents( {
		vendor: config.vendor,
		flowName,
		analyticsSection,
		query: query,
	} );

	const events: ComponentProps< typeof DomainSearch >[ 'events' ] = useMemo( () => {
		return {
			...mergeObjectFunctions( analyticsEvents, otherExternalEvents ),
			onBundleWouldShow,
			onContinue,
		};
	}, [ analyticsEvents, otherExternalEvents, onBundleWouldShow, onContinue ] );

	return {
		config,
		cart,
		events,
	};
};

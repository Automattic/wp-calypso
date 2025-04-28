import { Site } from '@automattic/data-stores';
import {
	AI_SITE_BUILDER_FLOW,
	ENTREPRENEUR_FLOW,
	StepContainer,
	addPlanToCart,
	addProductsToCart,
	createSiteWithCart,
	isCopySiteFlow,
	isEntrepreneurFlow,
	isNewHostedSiteCreationFlow,
	isNewsletterFlow,
	isReadymadeFlow,
	isStartWritingFlow,
	isOnboardingFlow,
	Step,
	isNewSiteMigrationFlow,
} from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import Loading from 'calypso/components/loading';
import useAddEcommerceTrialMutation from 'calypso/data/ecommerce/use-add-ecommerce-trial-mutation';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import {
	retrieveSignupDestination,
	getSignupCompleteFlowName,
	wasSignupCheckoutPageUnloaded,
	getSignupCompleteSlug,
} from 'calypso/signup/storageUtils';
import { useSelector } from 'calypso/state';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import { getUrlData } from 'calypso/state/imports/url-analyzer/selectors';
import { shouldUseStepContainerV2 } from '../../../helpers/should-use-step-container-v2';
import type { Step as StepType } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';
import './styles.scss';

const DEFAULT_SITE_MIGRATION_THEME = 'pub/zoologist';
const DEFAULT_ENTREPRENEUR_FLOW = 'pub/twentytwentytwo';
const DEFAULT_NEWSLETTER_THEME = 'pub/lettre';
// Changing this? Consider also updating WRITE_INTENT_DEFAULT_DESIGN so the write *intent* matches the write flow
const DEFAULT_START_WRITING_THEME = 'pub/poema';

function hasSourceSlug( data: unknown ): data is { sourceSlug: string } {
	if ( data && ( data as { sourceSlug: string } ).sourceSlug ) {
		return true;
	}
	return false;
}

const CreateSite: StepType = function CreateSite( { navigation, flow, data } ) {
	const { submit } = navigation;
	const { __ } = useI18n();

	const urlData = useSelector( getUrlData );

	const {
		domainItem,
		domainCartItem,
		domainCartItems = [],
		planCartItem,
		selectedSiteTitle,
		productCartItems,
		siteUrl,
		progress,
		partnerBundle,
	} = useSelect(
		( select: ( arg: string ) => OnboardSelect ) => ( {
			domainItem: select( ONBOARD_STORE ).getSelectedDomain(),
			domainCartItem: select( ONBOARD_STORE ).getDomainCartItem(),
			domainCartItems: select( ONBOARD_STORE ).getDomainCartItems(),
			planCartItem: select( ONBOARD_STORE ).getPlanCartItem(),
			productCartItems: select( ONBOARD_STORE ).getProductCartItems(),
			selectedSiteTitle: select( ONBOARD_STORE ).getSelectedSiteTitle(),
			siteUrl: select( ONBOARD_STORE ).getSiteUrl(),
			progress: select( ONBOARD_STORE ).getProgress(),
			partnerBundle: select( ONBOARD_STORE ).getPartnerBundle(),
		} ),
		[]
	);

	const { mutateAsync: addEcommerceTrial } = useAddEcommerceTrialMutation( partnerBundle );
	/**
	 * Support singular and multiple domain cart items.
	 */
	const mergedDomainCartItems = Array.isArray( domainCartItems ) ? domainCartItems.slice( 0 ) : [];
	if ( domainCartItem ) {
		mergedDomainCartItems.push( domainCartItem );
	}

	const username = useSelector( getCurrentUserName );

	const { setPendingAction } = useDispatch( ONBOARD_STORE );

	// when it's empty, the default WordPress theme will be used.
	let theme = '';
	if ( isCopySiteFlow( flow ) ) {
		theme = DEFAULT_SITE_MIGRATION_THEME;
	} else if ( isEntrepreneurFlow( flow ) ) {
		theme = DEFAULT_ENTREPRENEUR_FLOW;
	} else if ( isStartWritingFlow( flow ) ) {
		theme = DEFAULT_START_WRITING_THEME;
	} else if ( isNewsletterFlow( flow ) ) {
		theme = DEFAULT_NEWSLETTER_THEME;
	}

	const isPaidDomainItem = Boolean(
		domainCartItem?.product_slug ||
			( Array.isArray( domainCartItems ) && domainCartItems.some( ( el ) => el.product_slug ) )
	);

	// Default visibility is public
	let siteVisibility = Site.Visibility.PublicIndexed;
	const wooFlows = [ ENTREPRENEUR_FLOW ];

	// These flows default to "Coming Soon"
	if (
		isOnboardingFlow( flow ) ||
		isCopySiteFlow( flow ) ||
		isStartWritingFlow( flow ) ||
		isNewHostedSiteCreationFlow( flow ) ||
		isReadymadeFlow( flow ) ||
		wooFlows.includes( flow || '' ) ||
		flow === AI_SITE_BUILDER_FLOW
	) {
		siteVisibility = Site.Visibility.PublicNotIndexed;
	}

	const signupDestinationCookieExists = retrieveSignupDestination();
	const isReEnteringFlow = getSignupCompleteFlowName() === flow;
	//User has already reached checkout and then hit the browser back button.
	//In this case, site has already been created, and plan added to cart. We need to avoid to create another site.
	const isManageSiteFlow = Boolean(
		wasSignupCheckoutPageUnloaded() && signupDestinationCookieExists && isReEnteringFlow
	);
	const urlQueryParams = useQuery();
	const skipMigration = urlQueryParams.get( 'skipMigration' ) || '';
	const platform = urlQueryParams.get( 'platform' ) || '';
	const useThemeHeadstart = ! isStartWritingFlow( flow ) && ! isNewHostedSiteCreationFlow( flow );
	const shouldGoToCheckout = Boolean( planCartItem );

	async function createSite() {
		if ( isManageSiteFlow ) {
			const slug = getSignupCompleteSlug();

			if ( planCartItem && slug ) {
				await addPlanToCart( slug, flow, true, theme, planCartItem );
			}

			if ( productCartItems?.length && slug ) {
				await addProductsToCart( slug, flow, productCartItems );
			}

			return {
				siteSlug: getSignupCompleteSlug(),
				goToCheckout: shouldGoToCheckout,
				siteCreated: true,
			};
		}

		const siteIntent = isNewSiteMigrationFlow( flow ) ? 'migration' : '';

		const sourceSlug = hasSourceSlug( data ) ? data.sourceSlug : undefined;
		const site = await createSiteWithCart(
			flow,
			true,
			isPaidDomainItem,
			theme,
			siteVisibility,
			urlData?.meta.title ?? selectedSiteTitle,
			// We removed the color option during newsletter onboarding.
			// But backend still expects/needs a value, so supplying the default.
			// Ideally should remove this and update code downstream to handle this.
			'#113AF5',
			useThemeHeadstart,
			username,
			mergedDomainCartItems,
			partnerBundle,
			siteUrl,
			domainItem,
			sourceSlug,
			siteIntent
		);

		if ( isEntrepreneurFlow( flow ) && site ) {
			await addEcommerceTrial( { siteId: site.siteId } );

			return {
				siteId: site.siteId,
				siteSlug: site.siteSlug,
				goToCheckout: false,
				siteCreated: true,
			};
		}

		if ( planCartItem && site?.siteSlug ) {
			await addPlanToCart( site.siteSlug, flow, true, theme, planCartItem );
		}

		if ( productCartItems?.length && site?.siteSlug ) {
			await addProductsToCart( site.siteSlug, flow, productCartItems );
		}

		if ( domainCartItems?.length && site?.siteSlug ) {
			await addProductsToCart( site.siteSlug, flow, productCartItems );
		}

		return {
			siteId: site?.siteId,
			siteSlug: site?.siteSlug,
			goToCheckout: shouldGoToCheckout,
			siteCreated: true,
			skipMigration,
			platform,
		};
	}

	useEffect( () => {
		if ( submit ) {
			setPendingAction( createSite );
			submit();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	const title = __( 'Creating your site' );

	if ( shouldUseStepContainerV2( flow ) ) {
		return (
			<>
				<DocumentHead title={ title } />
				<Step.Loading title={ title } progress={ progress } delay={ 1000 } />
			</>
		);
	}

	return (
		<>
			<DocumentHead title={ title } />
			<StepContainer
				shouldHideNavButtons
				hideFormattedHeader
				stepName="create-site"
				recordTracksEvent={ recordTracksEvent }
				stepContent={ <Loading title={ title } progress={ progress } /> }
				showFooterWooCommercePowered={ false }
			/>
		</>
	);
};

export default CreateSite;

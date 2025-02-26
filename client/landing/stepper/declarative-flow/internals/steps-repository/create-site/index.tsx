import { Site } from '@automattic/data-stores';
import { FREE_THEME } from '@automattic/design-picker';
import {
	ENTREPRENEUR_FLOW,
	StepContainer,
	addPlanToCart,
	addProductsToCart,
	createSiteWithCart,
	isCopySiteFlow,
	isDesignFirstFlow,
	isFreeFlow,
	isImportFocusedFlow,
	isMigrationSignupFlow,
	isStartWritingFlow,
	isEntrepreneurFlow,
	isNewHostedSiteCreationFlow,
	isNewsletterFlow,
	isBlogOnboardingFlow,
	isSiteAssemblerFlow,
	isReadymadeFlow,
	isOnboardingFlow,
	setThemeOnSite,
} from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { getQueryArg } from '@wordpress/url';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import Loading from 'calypso/components/loading';
import useAddEcommerceTrialMutation from 'calypso/data/ecommerce/use-add-ecommerce-trial-mutation';
import useAddTempSiteToSourceOptionMutation from 'calypso/data/site-migration/use-add-temp-site-mutation';
import { useSourceMigrationStatusQuery } from 'calypso/data/site-migration/use-source-migration-status-query';
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
import { useGoalsFirstExperiment } from '../../../helpers/use-goals-first-experiment';
import type { Step } from '../../types';
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

const CreateSite: Step = function CreateSite( { navigation, flow, data } ) {
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
		siteGoals,
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
			siteGoals: select( ONBOARD_STORE ).getGoals(),
		} ),
		[]
	);

	const { mutateAsync: addEcommerceTrial } = useAddEcommerceTrialMutation( partnerBundle );
	const [ , isGoalsFirstExperiment ] = useGoalsFirstExperiment();

	/**
	 * Support singular and multiple domain cart items.
	 */
	const mergedDomainCartItems = Array.isArray( domainCartItems ) ? domainCartItems.slice( 0 ) : [];
	if ( domainCartItem ) {
		mergedDomainCartItems.push( domainCartItem );
	}

	const shouldSaveSiteGoals = isOnboardingFlow( flow ) && isGoalsFirstExperiment;

	const username = useSelector( getCurrentUserName );

	const { setPendingAction } = useDispatch( ONBOARD_STORE );

	// when it's empty, the default WordPress theme will be used.
	let theme = '';
	if ( isImportFocusedFlow( flow ) || isCopySiteFlow( flow ) ) {
		theme = DEFAULT_SITE_MIGRATION_THEME;
	} else if ( isEntrepreneurFlow( flow ) ) {
		theme = DEFAULT_ENTREPRENEUR_FLOW;
	} else if ( isStartWritingFlow( flow ) ) {
		theme = DEFAULT_START_WRITING_THEME;
	} else if ( isNewsletterFlow( flow ) ) {
		theme = DEFAULT_NEWSLETTER_THEME;
	}

	let preselectedThemeSlug = '';
	let preselectedThemeStyleVariation = '';

	// Maybe set the theme for the user instead of taking them to the update-design flow.
	// See: https://github.com/Automattic/wp-calypso/issues/83077
	if ( isDesignFirstFlow( flow ) ) {
		const themeSlug = getQueryArg( window.location.href, 'theme' );
		const themeType = getQueryArg( window.location.href, 'theme_type' );
		const styleVariation = getQueryArg( window.location.href, 'style_variation' );

		// Only do this for preselected free themes with style variation.
		if ( !! themeSlug && themeType === FREE_THEME && !! styleVariation ) {
			preselectedThemeSlug = `pub/${ themeSlug }`;
			preselectedThemeStyleVariation = styleVariation as string;
		}
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
		isFreeFlow( flow ) ||
		isImportFocusedFlow( flow ) ||
		isBlogOnboardingFlow( flow ) ||
		isNewHostedSiteCreationFlow( flow ) ||
		isSiteAssemblerFlow( flow ) ||
		isReadymadeFlow( flow ) ||
		wooFlows.includes( flow || '' )
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
	const { addTempSiteToSourceOption } = useAddTempSiteToSourceOptionMutation();
	const urlQueryParams = useQuery();
	const sourceSiteSlug = urlQueryParams.get( 'from' ) || '';
	const skipMigration = urlQueryParams.get( 'skipMigration' ) || '';
	const { data: sourceMigrationStatus } = useSourceMigrationStatusQuery( sourceSiteSlug );
	const useThemeHeadstart =
		! isStartWritingFlow( flow ) &&
		! isNewHostedSiteCreationFlow( flow ) &&
		! isSiteAssemblerFlow( flow ) &&
		! isMigrationSignupFlow( flow );
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

		const siteIntent = isMigrationSignupFlow( flow ) ? 'migration' : '';

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
			siteIntent,
			shouldSaveSiteGoals ? siteGoals : undefined
		);

		if ( preselectedThemeSlug && site?.siteSlug ) {
			await setThemeOnSite( site.siteSlug, preselectedThemeSlug, preselectedThemeStyleVariation );
		}

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

		if ( isImportFocusedFlow( flow ) && site?.siteSlug && sourceMigrationStatus?.source_blog_id ) {
			// Store temporary target blog id to source site option
			addTempSiteToSourceOption( site.siteId, sourceMigrationStatus?.source_blog_id );
		}

		return {
			siteId: site?.siteId,
			siteSlug: site?.siteSlug,
			goToCheckout: shouldGoToCheckout,
			hasSetPreselectedTheme: Boolean( preselectedThemeSlug ),
			siteCreated: true,
			skipMigration,
		};
	}

	useEffect( () => {
		if ( submit ) {
			setPendingAction( createSite );
			submit();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	const getCurrentMessage = () => {
		return __( 'Creating your site' );
	};

	const getSubTitle = () => {
		return null;
	};

	const subTitle = getSubTitle();

	return (
		<>
			<DocumentHead title={ getCurrentMessage() } />
			<StepContainer
				shouldHideNavButtons
				hideFormattedHeader
				stepName="create-site"
				recordTracksEvent={ recordTracksEvent }
				stepContent={
					<Loading title={ getCurrentMessage() } subtitle={ subTitle } progress={ progress } />
				}
				showFooterWooCommercePowered={ false }
			/>
		</>
	);
};

export default CreateSite;

import page from '@automattic/calypso-router';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo } from 'react';
import { useQuerySitePurchases } from 'calypso/components/data/query-site-purchases';
import { useQueryThemes } from 'calypso/components/data/query-theme';
import { useDispatch, useSelector } from 'calypso/state';
import {
	hasLoadedSitePurchasesFromServer,
	isFetchingSitePurchases,
} from 'calypso/state/purchases/selectors';
import { isJetpackSite, getSiteOption } from 'calypso/state/sites/selectors';
import { clearActivated } from 'calypso/state/themes/actions';
import {
	getThemes,
	isMarketplaceThemeSubscribed as getIsMarketplaceThemeSubscribed,
} from 'calypso/state/themes/selectors';
import { hasExternallyManagedThemes as getHasExternallyManagedThemes } from 'calypso/state/themes/selectors/is-externally-managed-theme';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { Theme } from 'calypso/types';
import { ThankYouThemeSection } from './marketplace-thank-you-theme-section';

type ThankYouThemeData = [
	Theme,
	React.ReactElement[],
	boolean,
	string,
	string,
	string[],
	boolean,
	React.ReactElement | null,
	boolean,
];

export function useThemesThankYouData(
	themeSlugs: string[],
	isOnboardingFlow: boolean,
	continueWithPluginBundle: boolean | null
): ThankYouThemeData {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId ) as number;
	const siteSlug = useSelector( getSelectedSiteSlug );
	const themeSlug = useSelector( ( state ) =>
		getSiteOption( state, siteId, 'theme_slug' )
	) as string;

	// texts
	const title = translate( 'Congrats on your new theme!' );
	const subtitle = translate(
		"Your new theme is a reflection of your unique style and personality, and we're thrilled to see it come to life."
	);

	useQuerySitePurchases( siteId );
	const isRequestingSitePurchases = useSelector( isFetchingSitePurchases );
	const hasLoadedSitePurchases = useSelector( hasLoadedSitePurchasesFromServer );

	const dotComThemes = useSelector( ( state ) => getThemes( state, 'wpcom', themeSlugs ) );
	const dotOrgThemes = useSelector( ( state ) => getThemes( state, 'wporg', themeSlugs ) );
	const themesList = useMemo(
		() => themeSlugs.map( ( slug, index ) => dotComThemes[ index ] || dotOrgThemes[ index ] ),
		[ dotComThemes, dotOrgThemes, themeSlugs ]
	);
	const allThemesFetched = themesList.every( ( theme ) => !! theme );

	const firstTheme = themesList[ 0 ] ?? null;

	const isActive = themesList.some(
		( theme ) => theme?.stylesheet === themeSlug || theme?.id === themeSlug
	);

	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );

	useQueryThemes( 'wpcom', themeSlugs );
	useQueryThemes( 'wporg', themeSlugs );

	const themesSection = themesList
		.filter( ( theme ) => theme )
		.map( ( theme: any ) => {
			return (
				<ThankYouThemeSection
					key={ `theme_${ theme.id }` }
					theme={ theme }
					isOnboardingFlow={ isOnboardingFlow }
				/>
			);
		} );

	const thankyouSteps = useMemo(
		() =>
			isJetpack
				? [ translate( 'Installing theme' ) ]
				: [
						translate( 'Activating the theme feature' ), // Transferring to Atomic
						translate( 'Setting up theme installation' ), // Transferring to Atomic
						translate( 'Installing theme' ), // Transferring to Atomic
						translate( 'Getting the theme ready' ),
				  ],
		// We intentionally don't set `isJetpack` as dependency to keep the same steps after the Atomic transfer.
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ translate ]
	);

	// DotOrg (if not also Dotcom) and Externay managed themes
	// needs an atomic site to be installed.
	const hasDotOrgThemes = dotOrgThemes.some(
		( theme: { id: string } | undefined ) =>
			!! theme &&
			! dotComThemes.find(
				( dotComTheme: { id: string } | undefined ) => dotComTheme?.id === theme.id
			)
	);

	const themesSubscribed = useSelector( ( state ) =>
		themeSlugs.filter( ( themeId ) => getIsMarketplaceThemeSubscribed( state, themeId, siteId ) )
	);

	const hasExternallyManagedThemesSubscribed = themesSubscribed.length > 0;

	const hasExternallyManagedThemes = useSelector( ( state ) =>
		getHasExternallyManagedThemes( state, themeSlugs )
	);

	useEffect( () => {
		if (
			! isRequestingSitePurchases &&
			hasLoadedSitePurchases &&
			! hasExternallyManagedThemesSubscribed &&
			hasExternallyManagedThemes
		) {
			page( `/home/${ siteSlug }` );
		}
	}, [
		hasExternallyManagedThemes,
		hasExternallyManagedThemesSubscribed,
		hasLoadedSitePurchases,
		isRequestingSitePurchases,
		siteSlug,
	] );

	const isAtomicNeeded =
		hasDotOrgThemes ||
		( hasExternallyManagedThemes &&
			( isRequestingSitePurchases || hasExternallyManagedThemesSubscribed ) );

	// Clear completed activated theme request state to avoid displaying the Thanks modal
	useEffect( () => {
		return () => {
			dispatch( clearActivated( siteId || 0 ) );
		};
	}, [ dispatch, siteId ] );

	// Redirect to the plugin bundle flow after the activation.
	useEffect( () => {
		if ( isActive && continueWithPluginBundle ) {
			page(
				`/setup/plugin-bundle/getCurrentThemeSoftwareSets?siteId=${ siteId }&siteSlug=${ siteSlug }`
			);
		}
	}, [ isActive, continueWithPluginBundle, siteId, siteSlug ] );

	// Redirect to the Theme Details page after the atomic transfer.
	useEffect( () => {
		if ( firstTheme && isAtomicNeeded && isJetpack ) {
			page(
				addQueryArgs( `/theme/${ firstTheme.id }/${ siteSlug }`, {
					activating: true,
					...( isOnboardingFlow ? { onboarding: true } : {} ),
				} )
			);
		}
	}, [ firstTheme, isAtomicNeeded, isJetpack, isOnboardingFlow, siteSlug ] );

	return [
		firstTheme,
		themesSection,
		allThemesFetched,
		title,
		subtitle,
		thankyouSteps,
		isAtomicNeeded,
		null,
		// Always display the loading screen for the following situations:
		// - Redirect to the plugin-bundle flow after the theme is activated for Woo themes.
		// - Redirect to the Theme Details page after the atomic transfer if it's required.
		// - Redirect to the /home page if the user removed the externally managed theme from checkout.
		! ( continueWithPluginBundle || isAtomicNeeded || ! isRequestingSitePurchases ),
	];
}

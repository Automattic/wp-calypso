import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useEffect, useMemo } from 'react';
import { useQueryThemes } from 'calypso/components/data/query-theme';
import { ThankYouSectionProps, ThankYouThemeData } from 'calypso/components/thank-you/types';
import { useDispatch, useSelector } from 'calypso/state';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { clearActivated } from 'calypso/state/themes/actions';
import { getThemes } from 'calypso/state/themes/selectors';
import { hasExternallyManagedThemes as getHasExternallyManagedThemes } from 'calypso/state/themes/selectors/is-externally-managed-theme';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { ThankYouThemeSection } from './marketplace-thank-you-theme-section';
import MasterbarStyled from './masterbar-styled';

export function useThemesThankYouData(
	themeSlugs: string[],
	isOnboardingFlow: boolean,
	continueWithPluginBundle: boolean | null
): ThankYouThemeData {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );

	// texts
	const title = translate( 'Congrats on your new theme!' );
	const subtitle = translate(
		"Your new theme is a reflection of your unique style and personality, and we're thrilled to see it come to life."
	);

	const dotComThemes = useSelector( ( state ) => getThemes( state, 'wpcom', themeSlugs ) );
	const dotOrgThemes = useSelector( ( state ) => getThemes( state, 'wporg', themeSlugs ) );
	const themesList = useMemo(
		() => themeSlugs.map( ( slug, index ) => dotComThemes[ index ] || dotOrgThemes[ index ] ),
		[ dotComThemes, dotOrgThemes, themeSlugs ]
	);
	const allThemesFetched = themesList.every( ( theme ) => !! theme );

	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );

	useQueryThemes( 'wpcom', themeSlugs );
	useQueryThemes( 'wporg', themeSlugs );

	// Clear completed activated theme request state to avoid displaying the Thanks modal
	useEffect( () => {
		return () => {
			dispatch( clearActivated( siteId || 0 ) );
		};
	}, [ dispatch, siteId ] );

	const themesSection: ThankYouSectionProps = {
		sectionKey: 'theme_information',
		nextSteps: themesList
			.filter( ( theme ) => theme )
			.map( ( theme ) => ( {
				stepKey: `theme_information_${ theme.id }`,
				stepSection: (
					<ThankYouThemeSection
						theme={ theme }
						isOnboardingFlow={ isOnboardingFlow }
						continueWithPluginBundle={ continueWithPluginBundle }
					/>
				),
			} ) ),
	};

	const goBackSection = (
		<MasterbarStyled
			onClick={ () => page( `/themes/${ siteSlug }` ) }
			backText={ translate( 'Back to the dashboard' ) }
			canGoBack={ allThemesFetched }
			showContact={ allThemesFetched }
		/>
	);

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
	type Theme = { id: string } | undefined;
	const hasDotOrgThemes = dotOrgThemes.some(
		( theme: Theme ) =>
			!! theme && ! dotComThemes.find( ( dotComTheme: Theme ) => dotComTheme?.id === theme.id )
	);
	const hasExternallyManagedThemes = useSelector( ( state ) =>
		getHasExternallyManagedThemes( state, themeSlugs )
	);
	const isAtomicNeeded = hasDotOrgThemes || hasExternallyManagedThemes;

	return [
		themesList,
		themesSection,
		allThemesFetched,
		goBackSection,
		title,
		subtitle,
		thankyouSteps,
		isAtomicNeeded,
		null,
	];
}

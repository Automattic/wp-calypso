import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useQueryThemes } from 'calypso/components/data/query-theme';
import { ThankYouData, ThankYouSectionProps } from 'calypso/components/thank-you/types';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getThemes } from 'calypso/state/themes/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { ThankYouThemeSection } from './marketplace-thank-you-theme-section';
import MasterbarStyled from './masterbar-styled';

export function useThemesThankYouData( themeSlugs: string[] ): ThankYouData {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );

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

	const themesSection: ThankYouSectionProps = {
		sectionKey: 'theme_information',
		nextSteps: themesList.map( ( theme ) => ( {
			stepKey: `theme_information_${ theme?.id }`,
			stepSection: <ThankYouThemeSection theme={ theme } />,
		} ) ),
	};

	const goBackSection = (
		<MasterbarStyled
			onClick={ () => page( `/themes/${ siteSlug }` ) }
			backText={ translate( 'Back to themes' ) }
			canGoBack={ allThemesFetched }
			showContact={ allThemesFetched }
		/>
	);

	const thankyouSteps = useMemo(
		() => {
			if ( themeSlugs.length === 0 ) {
				return [];
			}

			if ( isJetpack ) {
				return [ translate( 'Installing theme' ) ];
			}

			return [
				translate( 'Activating the theme feature' ), // Transferring to Atomic
				translate( 'Setting up theme installation' ), // Transferring to Atomic
				translate( 'Installing theme' ), // Transferring to Atomic
				translate( 'Activating theme' ),
			];
		},
		// We intentionally don't set `isJetpack` as dependency to keep the same steps after the Atomic transfer.
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ translate ]
	);

	return [ themesSection, allThemesFetched, goBackSection, thankyouSteps ];
}

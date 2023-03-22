import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useQueryThemes } from 'calypso/components/data/query-theme';
import { ThankYouSectionProps } from 'calypso/components/thank-you/types';
import { getThemes } from 'calypso/state/themes/selectors';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { ThankYouThemeSection } from './marketplace-thank-you-theme-section';
import MasterbarStyled from './masterbar-styled';

export function useThemesThankYouData(
	themeSlugs: string[]
): [ ThankYouSectionProps, boolean, JSX.Element ] {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug );

	const dotComThemes = useSelector( ( state ) => getThemes( state, 'wpcom', themeSlugs ) );
	const dotOrgThemes = useSelector( ( state ) => getThemes( state, 'wporg', themeSlugs ) );
	const themesList = useMemo(
		() => themeSlugs.map( ( slug, index ) => dotComThemes[ index ] || dotOrgThemes[ index ] ),
		[ dotComThemes, dotOrgThemes, themeSlugs ]
	);
	const allThemesFetched = themesList.every( ( theme ) => !! theme );

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

	return [ themesSection, allThemesFetched, goBackSection ];
}

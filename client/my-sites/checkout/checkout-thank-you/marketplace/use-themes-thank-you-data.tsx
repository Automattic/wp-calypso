import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useQueryThemes } from 'calypso/components/data/query-theme';
import { ThankYouSectionProps } from 'calypso/components/thank-you/types';
import { getThemes } from 'calypso/state/themes/selectors';

export function useThemesThankYouData( themeSlugs: string[] ): [ ThankYouSectionProps, boolean ] {
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
			stepSection: <></>, // TODO: Add theme card
		} ) ),
	};

	return [ themesSection, allThemesFetched ];
}

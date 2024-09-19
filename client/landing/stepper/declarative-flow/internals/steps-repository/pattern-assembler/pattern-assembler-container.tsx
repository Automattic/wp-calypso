import { BlockRendererProvider, PatternsRendererProvider } from '@automattic/block-renderer';
import { getPlaceholderSiteID } from '@automattic/data-stores/src/site/constants';
import { useMemo } from 'react';
import StepperLoader from '../../components/stepper-loader';
import { encodePatternId } from './utils';
import type { Pattern } from './types';
import type { SiteInfo } from '@automattic/block-renderer';

interface Props {
	siteId: number | string;
	stylesheet: string;
	patternsMapByCategory: Record< string, Pattern[] >;
	children: JSX.Element;
	siteInfo: SiteInfo;
	isNewSite: boolean;
}

const PatternAssemblerContainer = ( {
	siteId,
	stylesheet,
	patternsMapByCategory,
	children,
	siteInfo,
	isNewSite,
}: Props ) => {
	const patternIdsByCategory = useMemo(
		() =>
			Object.fromEntries(
				Object.entries( patternsMapByCategory ).map( ( [ category, patterns ] ) => [
					category,
					patterns.map( ( pattern ) => encodePatternId( pattern.ID ) ),
				] )
			),
		[ patternsMapByCategory ]
	);

	return (
		<BlockRendererProvider
			siteId={ siteId }
			stylesheet={ stylesheet }
			useInlineStyles
			placeholder={ <StepperLoader /> }
		>
			<PatternsRendererProvider
				// Site used to render site-related things on the previews,
				// such as the logo, title, tagline, pages, posts, etc.
				// For the newly created site, we use the placeholder site to render the content.
				// Otherwise, we use the current site to display the site-related blocks.
				siteId={ isNewSite ? getPlaceholderSiteID() : siteId }
				stylesheet={ stylesheet }
				patternIdsByCategory={ patternIdsByCategory }
				// Use siteInfo to overwrite site-related things such as title, and tagline.
				siteInfo={ siteInfo }
				shouldShufflePosts={ isNewSite }
			>
				{ children }
			</PatternsRendererProvider>
		</BlockRendererProvider>
	);
};

export default PatternAssemblerContainer;

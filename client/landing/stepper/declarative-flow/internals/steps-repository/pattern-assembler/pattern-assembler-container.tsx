import { BlockRendererProvider, PatternsRendererProvider } from '@automattic/block-renderer';
import { PLACEHOLDER_SITE_ID } from '@automattic/data-stores/src/site/constants';
import StepperLoader from '../../components/stepper-loader';
import type { SiteInfo } from '@automattic/block-renderer';

interface Props {
	siteId: number | string;
	stylesheet: string;
	patternIds: string[];
	children: JSX.Element;
	siteInfo: SiteInfo;
	isNewSite?: boolean;
}

const PatternAssemblerContainer = ( {
	siteId,
	stylesheet,
	patternIds,
	children,
	siteInfo,
	isNewSite,
}: Props ) => (
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
			siteId={ isNewSite ? PLACEHOLDER_SITE_ID : siteId }
			stylesheet={ stylesheet }
			patternIds={ patternIds }
			// Use siteInfo to overwrite site-related things such as title, and tagline.
			siteInfo={ siteInfo }
		>
			{ children }
		</PatternsRendererProvider>
	</BlockRendererProvider>
);

export default PatternAssemblerContainer;

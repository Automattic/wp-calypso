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
			// such as the logo, title, and tagline.
			siteId={ PLACEHOLDER_SITE_ID }
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

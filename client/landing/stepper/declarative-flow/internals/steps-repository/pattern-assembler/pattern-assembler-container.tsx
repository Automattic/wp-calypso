import { BlockRendererProvider, PatternsRendererProvider } from '@automattic/block-renderer';
import { PLACEHOLDER_SITE_ID } from '@automattic/data-stores/src/site/constants';
import { ExperimentalBlockEditorProvider } from '@automattic/global-styles';
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

// Use fake assets to eliminate the compatStyles without the id.
// See https://github.com/WordPress/gutenberg/blob/f77958cfc13c02b0c0e6b9b697b43bbcad4ba40b/packages/block-editor/src/components/iframe/index.js#L127
const BLOCK_EDITOR_SETTINGS = {
	__unstableResolvedAssets: {
		styles: '<style id="" />',
	},
};

const PatternAssemblerContainer = ( {
	siteId,
	stylesheet,
	patternIds,
	children,
	siteInfo,
	isNewSite,
}: Props ) => (
	<ExperimentalBlockEditorProvider settings={ BLOCK_EDITOR_SETTINGS }>
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
	</ExperimentalBlockEditorProvider>
);

export default PatternAssemblerContainer;

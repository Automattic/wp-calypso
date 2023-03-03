import { BlockRendererProvider, PatternsRendererProvider } from '@automattic/block-renderer';
import { isEnabled } from '@automattic/calypso-config';
import { PLACEHOLDER_SITE_ID } from './constants';
import type { SiteInfo } from '@automattic/block-renderer';

interface Props {
	siteId: number | string;
	stylesheet: string;
	patternIds: string[];
	children: JSX.Element;
	siteInfo: SiteInfo;
}

const PatternAssemblerContainer = ( {
	siteId,
	stylesheet,
	patternIds,
	children,
	siteInfo,
}: Props ) => (
	<BlockRendererProvider
		siteId={ siteId }
		stylesheet={ stylesheet }
		useInlineStyles={ isEnabled( 'pattern-assembler/inline-styles' ) }
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

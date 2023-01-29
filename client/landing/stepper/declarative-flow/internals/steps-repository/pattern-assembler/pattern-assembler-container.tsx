import { BlockRendererProvider, PatternsRendererProvider } from '@automattic/block-renderer';
import { POST_SITE_ID } from './constants';
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
	<BlockRendererProvider siteId={ siteId } stylesheet={ stylesheet }>
		<PatternsRendererProvider
			// Use this site to render the posts of query patterns.
			siteId={ POST_SITE_ID }
			stylesheet={ stylesheet }
			patternIds={ patternIds }
			// Use siteInfo for user's site title, and tagline.
			siteInfo={ siteInfo }
		>
			{ children }
		</PatternsRendererProvider>
	</BlockRendererProvider>
);

export default PatternAssemblerContainer;

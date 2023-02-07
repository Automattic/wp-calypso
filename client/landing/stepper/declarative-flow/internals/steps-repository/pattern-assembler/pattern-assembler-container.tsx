import { BlockRendererProvider, PatternsRendererProvider } from '@automattic/block-renderer';
import { GlobalStylesProvider } from '@automattic/global-styles';
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
}: Props ) => {
	const commonProps = {
		siteId,
		stylesheet,
	};

	// TODO: We might need to lazy load the GlobalStylesProvider
	return (
		<GlobalStylesProvider { ...commonProps }>
			<BlockRendererProvider { ...commonProps }>
				<PatternsRendererProvider
					{ ...commonProps }
					// Site used to render site-related things on the previews,
					// such as the logo, title, and tagline.
					siteId={ PLACEHOLDER_SITE_ID }
					patternIds={ patternIds }
					// Use siteInfo to overwrite site-related things such as title, and tagline.
					siteInfo={ siteInfo }
				>
					{ children }
				</PatternsRendererProvider>
			</BlockRendererProvider>
		</GlobalStylesProvider>
	);
};

export default PatternAssemblerContainer;

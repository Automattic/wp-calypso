import BlockRendererContainer, { BlockRendererContainerProps } from './block-renderer-container';
import { usePatternsRendererContext } from './patterns-renderer-context';
import type { CSSProperties } from 'react';

interface Props extends BlockRendererContainerProps {
	patternId: string;
	isContentOnly?: boolean;
}

const PatternRenderer = ( { patternId, isContentOnly, ...props }: Omit< Props, 'children' > ) => {
	const renderedPatterns = usePatternsRendererContext();
	const pattern = renderedPatterns[ patternId ];
	const style = { pointerEvents: 'none' } as CSSProperties;
	const content = (
		<div
			// eslint-disable-next-line react/no-danger
			dangerouslySetInnerHTML={ { __html: pattern?.html ?? '' } }
			style={ style }
		/>
	);

	if ( isContentOnly ) {
		return content;
	}

	return (
		<BlockRendererContainer
			{ ...props }
			styles={ pattern?.styles ?? [] }
			scripts={ pattern?.scripts ?? '' }
		>
			{ content }
		</BlockRendererContainer>
	);
};

export default PatternRenderer;

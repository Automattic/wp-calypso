import usePatternMinHeightVh from '../hooks/use-pattern-min-height-vh';
import BlockRendererContainer from './block-renderer-container';
import { usePatternsRendererContext } from './patterns-renderer-context';
interface Props {
	patternId: string;
	viewportWidth?: number;
	viewportHeight?: number;
	minHeight?: number;
	maxHeight?: 'none' | number;
	minHeightFor100vh?: number;
	placeholder?: JSX.Element;
}

const PatternRenderer = ( {
	patternId,
	viewportWidth,
	viewportHeight,
	minHeight,
	maxHeight,
	minHeightFor100vh,
}: Props ) => {
	const renderedPatterns = usePatternsRendererContext();
	const pattern = renderedPatterns[ patternId ];
	const patternHtml = usePatternMinHeightVh( pattern?.html, viewportHeight );

	return (
		<BlockRendererContainer
			styles={ pattern?.styles ?? [] }
			scripts={ pattern?.scripts ?? '' }
			viewportWidth={ viewportWidth }
			viewportHeight={ viewportHeight }
			maxHeight={ maxHeight }
			minHeight={ minHeight }
			isMinHeight100vh={ pattern?.html?.includes( 'min-height:100vh' ) }
			minHeightFor100vh={ minHeightFor100vh }
		>
			<div
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={ { __html: patternHtml ?? '' } }
			/>
		</BlockRendererContainer>
	);
};

export default PatternRenderer;

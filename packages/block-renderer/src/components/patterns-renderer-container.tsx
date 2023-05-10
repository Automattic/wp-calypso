import { useMemo } from 'react';
import BlockRendererContainer, { BlockRendererContainerProps } from './block-renderer-container';
import { usePatternsRendererContext } from './patterns-renderer-context';

interface Props extends BlockRendererContainerProps {
	patternIds: string[];
}

const PatternsRendererContainer = ( { patternIds, ...props }: Props ) => {
	const renderedPatterns = usePatternsRendererContext();
	const styles = useMemo(
		() =>
			patternIds
				.flatMap( ( patternId ) => renderedPatterns[ patternId ]?.styles )
				.filter( Boolean ),
		[ patternIds ]
	);

	return <BlockRendererContainer { ...props } styles={ styles } />;
};

export default PatternsRendererContainer;

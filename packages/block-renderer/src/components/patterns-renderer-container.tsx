import { useMemo } from 'react';
import BlockRendererContainer, { BlockRendererContainerProps } from './block-renderer-container';
import { usePatternsRendererContext } from './patterns-renderer-context';

interface Props extends BlockRendererContainerProps {
	patternIds: string[];
}

const PatternsRendererContainer = ( { patternIds, ...props }: Props ) => {
	const renderedPatterns = usePatternsRendererContext();
	const { styles, scripts } = useMemo( () => {
		const patterns = patternIds.map( ( patternId ) => renderedPatterns[ patternId ] );
		const styles = patterns.flatMap( ( pattern ) => pattern?.styles ).filter( Boolean );
		const scripts = patterns.map( ( pattern ) => pattern?.scripts ).join( '' );

		return {
			styles,
			scripts,
		};
	}, [ patternIds, renderedPatterns ] );

	return <BlockRendererContainer { ...props } styles={ styles } scripts={ scripts } />;
};

export default PatternsRendererContainer;

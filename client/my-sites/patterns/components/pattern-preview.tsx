import { PatternRenderer } from '@automattic/block-renderer';
import { usePatternsRendererContext } from '@automattic/block-renderer/src/components/patterns-renderer-context';
import { useResizeObserver } from '@wordpress/compose';
import classNames from 'classnames';
import { encodePatternId } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/pattern-assembler/utils';
import type { Pattern } from 'calypso/my-sites/patterns/types';

import './pattern-preview.scss';

const DESKTOP_VIEWPORT_WIDTH = 1200;

type PatternPreviewProps = {
	isGridView?: boolean;
	pattern: Pattern;
};

export function PatternPreview( { isGridView, pattern }: PatternPreviewProps ) {
	const { renderedPatterns } = usePatternsRendererContext();
	const patternId = encodePatternId( pattern.ID );
	const renderedPattern = renderedPatterns[ patternId ];
	const [ resizeObserver, nodeSize ] = useResizeObserver();

	return (
		<div
			className={ classNames( 'pattern-preview', {
				'is-loading': ! renderedPattern,
			} ) }
		>
			{ resizeObserver }

			<div className="pattern-preview__renderer">
				<PatternRenderer
					minHeight={ nodeSize.width ? nodeSize.width / ( 7 / 3 ) : undefined }
					patternId={ patternId }
					viewportWidth={ isGridView ? DESKTOP_VIEWPORT_WIDTH : undefined }
				/>
			</div>

			<div className="pattern-preview__title">{ pattern.title }</div>
		</div>
	);
}

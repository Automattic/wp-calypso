import { PatternRenderer } from '@automattic/block-renderer';
import { usePatternsRendererContext } from '@automattic/block-renderer/src/components/patterns-renderer-context';
import { useResizeObserver } from '@wordpress/compose';
import classNames from 'classnames';
import { encodePatternId } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/pattern-assembler/utils';
import type { Pattern } from 'calypso/my-sites/patterns/types';

import './pattern-preview.scss';

export const DESKTOP_VIEWPORT_WIDTH = 1200;

export const ASPECT_RATIO = 7 / 4;

type PatternPreviewProps = {
	hideTitle?: boolean;
	pattern: Pattern | null;
	viewportWidth?: number;
};

export function PatternPreview( {
	hideTitle = false,
	pattern,
	viewportWidth,
}: PatternPreviewProps ) {
	const { renderedPatterns } = usePatternsRendererContext();
	const patternId = encodePatternId( pattern?.ID ?? 0 );
	const renderedPattern = renderedPatterns[ patternId ];
	const [ resizeObserver, nodeSize ] = useResizeObserver();

	if ( ! pattern ) {
		return null;
	}

	return (
		<div
			className={ classNames( 'pattern-preview', {
				'is-loading': ! renderedPattern,
			} ) }
		>
			{ resizeObserver }

			<div className="pattern-preview__renderer">
				<PatternRenderer
					minHeight={ nodeSize.width ? nodeSize.width / ASPECT_RATIO : undefined }
					patternId={ patternId }
					viewportWidth={ viewportWidth }
				/>
			</div>

			{ ! hideTitle && <div className="pattern-preview__title">{ pattern.title }</div> }
		</div>
	);
}

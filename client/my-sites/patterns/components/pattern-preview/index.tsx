import { PatternRenderer } from '@automattic/block-renderer';
import { usePatternsRendererContext } from '@automattic/block-renderer/src/components/patterns-renderer-context';
import { useResizeObserver } from '@wordpress/compose';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import { encodePatternId } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/pattern-assembler/utils';
import type { Pattern } from 'calypso/my-sites/patterns/types';

import './style.scss';

export const DESKTOP_VIEWPORT_WIDTH = 1200;
export const ASPECT_RATIO = 7 / 4;

type PatternPreviewProps = {
	className?: string;
	pattern: Pattern | null;
	viewportWidth?: number;
};

export function PatternPreview( { className, pattern, viewportWidth }: PatternPreviewProps ) {
	const [ isCopied, setIsCopied ] = useState( false );
	const { renderedPatterns } = usePatternsRendererContext();
	const patternId = encodePatternId( pattern?.ID ?? 0 );
	const renderedPattern = renderedPatterns[ patternId ];
	const [ resizeObserver, nodeSize ] = useResizeObserver();

	useEffect( () => {
		if ( ! isCopied ) {
			return;
		}

		const timeoutId = setTimeout( () => {
			setIsCopied( false );
		}, 3500 );

		return () => {
			clearTimeout( timeoutId );
		};
	}, [ isCopied ] );

	if ( ! pattern ) {
		return null;
	}

	return (
		<div
			className={ classNames( 'pattern-preview', className, {
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

			<div className="pattern-preview__header">
				<div className="pattern-preview__title">{ pattern.title }</div>

				<ClipboardButton
					className="pattern-preview__copy pattern-preview__copy--large"
					onCopy={ () => {
						setIsCopied( true );
					} }
					primary
					text={ pattern?.html ?? '' }
				>
					{ isCopied ? 'Pattern copied!' : 'Copy pattern' }
				</ClipboardButton>

				<ClipboardButton
					borderless
					className="pattern-preview__copy pattern-preview__copy--small"
					onCopy={ () => {
						setIsCopied( true );
					} }
					text={ pattern?.html ?? '' }
					transparent
				>
					{ isCopied ? 'Copied' : 'Copy' }
				</ClipboardButton>
			</div>
		</div>
	);
}

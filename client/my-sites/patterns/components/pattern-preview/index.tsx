import { PatternRenderer } from '@automattic/block-renderer';
import { usePatternsRendererContext } from '@automattic/block-renderer/src/components/patterns-renderer-context';
import { Button } from '@automattic/components';
import { useResizeObserver } from '@wordpress/compose';
import { Icon, lock } from '@wordpress/icons';
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
	canCopy?: boolean;
	pattern: Pattern | null;
	viewportWidth?: number;
};

export function PatternPreview( {
	className,
	canCopy = true,
	pattern,
	viewportWidth,
}: PatternPreviewProps ) {
	const [ isCopied, setIsCopied ] = useState( false );
	const { renderedPatterns } = usePatternsRendererContext();
	const patternId = encodePatternId( pattern?.ID ?? 0 );
	const renderedPattern = renderedPatterns[ patternId ];
	const [ resizeObserver, nodeSize ] = useResizeObserver();

	const isPreviewLarge = nodeSize?.width ? nodeSize.width > 960 : true;
	let copyButtonText = isPreviewLarge ? 'Copy pattern' : 'Copy';

	if ( isCopied ) {
		copyButtonText = isPreviewLarge ? 'Pattern copied!' : 'Copied';
	}

	useEffect( () => {
		if ( ! isCopied ) {
			return;
		}

		const timeoutId = setTimeout( () => {
			setIsCopied( false );
		}, 4500 );

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

				{ canCopy && (
					<ClipboardButton
						className="pattern-preview__copy"
						onCopy={ () => {
							setIsCopied( true );
						} }
						text={ pattern?.html ?? '' }
						primary
						transparent={ ! canCopy }
					>
						{ copyButtonText }
					</ClipboardButton>
				) }

				{ ! canCopy && (
					<Button className="pattern-preview__get-access" borderless transparent>
						<Icon height={ 18 } icon={ lock } width={ 18 } /> Get access
					</Button>
				) }
			</div>
		</div>
	);
}

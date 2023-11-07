import { PatternRenderer } from '@automattic/block-renderer';
import { Dialog } from '@automattic/components';
import { __unstableCompositeItem as CompositeItem } from '@wordpress/components';
import { CSSProperties, useMemo } from 'react';
import { encodePatternId } from './utils';
import type { Pattern } from './types';
import './pattern-page-preview.scss';

interface PatternPagePreviewModalProps {
	style: CSSProperties;
	patterns: Pattern[];
	shouldShufflePosts: boolean;
	isOpen: boolean;
	onClose: () => void;
}

interface PatternPagePreviewProps {
	composite: Record< string, unknown >;
	title: string;
	style: CSSProperties;
	patterns: Pattern[];
	shouldShufflePosts: boolean;
	onClick: ( patterns: Pattern[] ) => void;
}

const PATTERN_PAGE_PREVIEW_ITEM_VIEWPORT_HEIGHT = 500;
const PATTERN_PAGE_PREVIEW_ITEM_VIEWPORT_WIDTH = 1080;

export const PatternPagePreviewModal = ( {
	style,
	patterns,
	shouldShufflePosts,
	isOpen,
	onClose,
}: PatternPagePreviewModalProps ) => {
	return (
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		<Dialog
			additionalClassNames="pattern-assembler__preview-modal"
			additionalOverlayClassNames="pattern-assembler__preview-modal__backdrop"
			className="pattern-assembler__preview-modal__wrapper"
			isVisible={ isOpen }
			isFullScreen
			shouldCloseOnEsc
			onClose={ onClose }
		>
			<div className="pattern-assembler__preview-modal__content" style={ style }>
				{ patterns.map( ( pattern ) => (
					<PatternRenderer
						key={ pattern.ID }
						patternId={ encodePatternId( pattern.ID ) }
						viewportWidth={ PATTERN_PAGE_PREVIEW_ITEM_VIEWPORT_WIDTH }
						viewportHeight={ PATTERN_PAGE_PREVIEW_ITEM_VIEWPORT_HEIGHT }
						shouldShufflePosts={ shouldShufflePosts }
					/>
				) ) }
			</div>
		</Dialog>
	);
};

const PatternPagePreview = ( {
	composite,
	title,
	style,
	patterns,
	shouldShufflePosts,
	onClick,
}: PatternPagePreviewProps ) => {
	const validPatterns = useMemo( () => patterns.filter( Boolean ) as Pattern[], [ patterns ] );

	return (
		<div className="pattern-assembler__preview">
			<CompositeItem
				{ ...composite }
				role="option"
				as="button"
				className="pattern-assembler__preview-frame"
				aria-label={ title }
				onClick={ () => onClick( validPatterns ) }
			>
				<div className="pattern-assembler__preview-frame-content" style={ style }>
					{ validPatterns.map( ( pattern ) => (
						<PatternRenderer
							key={ pattern.ID }
							patternId={ encodePatternId( pattern.ID ) }
							viewportWidth={ PATTERN_PAGE_PREVIEW_ITEM_VIEWPORT_WIDTH }
							viewportHeight={ PATTERN_PAGE_PREVIEW_ITEM_VIEWPORT_HEIGHT }
							shouldShufflePosts={ shouldShufflePosts }
						/>
					) ) }
				</div>
			</CompositeItem>
			<div className="pattern-assembler__preview-title">{ title }</div>
		</div>
	);
};

export default PatternPagePreview;

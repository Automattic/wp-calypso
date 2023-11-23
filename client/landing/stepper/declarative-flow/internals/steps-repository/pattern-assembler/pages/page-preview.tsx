import { PatternRenderer } from '@automattic/block-renderer';
import { Dialog } from '@automattic/components';
import { __unstableCompositeItem as CompositeItem } from '@wordpress/components';
import { CSSProperties, useCallback, useMemo } from 'react';
import prependTitleBlockToPagePattern from '../html-transformers/prepend-title-block-to-page-pattern';
import { encodePatternId, isPagePattern } from '../utils';
import type { Pattern } from '../types';
import './page-preview.scss';

interface BasePageProps {
	style: CSSProperties;
	patterns: Pattern[];
	transformPatternHtml: ( patternHtml: string ) => string;
	shouldShufflePosts: boolean;
}

interface PageProps extends BasePageProps {
	className: string;
}

interface PagePreviewModalProps extends BasePageProps {
	isOpen: boolean;
	onClose: () => void;
}

interface PagePreviewProps extends BasePageProps {
	composite: Record< string, unknown >;
	title: string;
	onClick: ( patterns: Pattern[] ) => void;
}

const PATTERN_PAGE_PREVIEW_ITEM_VIEWPORT_HEIGHT = 500;
const PATTERN_PAGE_PREVIEW_ITEM_VIEWPORT_WIDTH = 1080;

const Page = ( {
	className,
	style,
	patterns,
	transformPatternHtml,
	shouldShufflePosts,
}: PageProps ) => {
	const pageTitle = useMemo( () => {
		return patterns.find( isPagePattern )?.title ?? '';
	}, [ patterns ] );

	const transformPagePatternHtml = useCallback(
		( patternHtml: string ) => {
			const transformedPatternHtml = transformPatternHtml( patternHtml );
			return prependTitleBlockToPagePattern( transformedPatternHtml, pageTitle );
		},
		[ transformPatternHtml, pageTitle ]
	);

	return (
		<div className={ className } style={ style }>
			{ patterns.map( ( pattern ) => (
				<PatternRenderer
					key={ pattern.ID }
					patternId={ encodePatternId( pattern.ID ) }
					viewportWidth={ PATTERN_PAGE_PREVIEW_ITEM_VIEWPORT_WIDTH }
					viewportHeight={ PATTERN_PAGE_PREVIEW_ITEM_VIEWPORT_HEIGHT }
					transformHtml={
						isPagePattern( pattern ) ? transformPagePatternHtml : transformPatternHtml
					}
					shouldShufflePosts={ shouldShufflePosts }
				/>
			) ) }
		</div>
	);
};

export const PagePreviewModal = ( { isOpen, onClose, ...pageProps }: PagePreviewModalProps ) => {
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
			<Page className="pattern-assembler__preview-modal__content" { ...pageProps } />
		</Dialog>
	);
};

const PatternPagePreview = ( { composite, onClick, ...pageProps }: PagePreviewProps ) => {
	const { title, patterns } = pageProps;
	return (
		<div className="pattern-assembler__preview">
			<CompositeItem
				{ ...composite }
				role="option"
				as="button"
				className="pattern-assembler__preview-frame"
				aria-label={ title }
				onClick={ () => onClick( patterns ) }
			>
				<Page className="pattern-assembler__preview-frame-content" { ...pageProps } />
			</CompositeItem>
			<div className="pattern-assembler__preview-title">{ title }</div>
		</div>
	);
};

export default PatternPagePreview;

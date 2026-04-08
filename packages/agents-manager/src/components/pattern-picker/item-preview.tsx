// @ts-expect-error -- BlockPreview is not in the public type definitions.
import { BlockPreview, store as blockEditorStore } from '@wordpress/block-editor';
import { Spinner } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from '@wordpress/element';
import usePatterns from '../../hooks/use-patterns';
import useTemplateParts from '../../hooks/use-template-parts';
import { getCanvasIframeElements } from '../../utils/canvas-iframe-elements';
import {
	isTemplatePartPatternSlug,
	TemplatePartPatternSlug,
	TemplatePartSlug,
} from '../../utils/template-parts';
import type { BlockData, Layout, Pattern } from './types';

const MAX_SHOWN_PATTERNS = 4;

/**
 * Forces `core/navigation` blocks to always display as full-width menus,
 * preventing them from collapsing into a hamburger at narrow viewport widths.
 */
const unsetNavigationBlockMobileLayout = ( blocks: BlockData[] ): BlockData[] => {
	return blocks.map( ( block ) => {
		if ( block.name === 'core/navigation' ) {
			return {
				...block,
				attributes: { ...block.attributes, overlayMenu: 'never' },
			};
		}
		if ( block.innerBlocks?.length ) {
			return {
				...block,
				innerBlocks: unsetNavigationBlockMobileLayout( block.innerBlocks ),
			};
		}
		return block;
	} );
};

interface Props {
	item: Layout;
	index: number;
	clientId?: string | null;
	onAfterClick?: ( id: string, index: number ) => void;
	isFullLayout?: boolean;
	isSelected?: boolean;
	viewportWidth?: number;
	additionalStyles?: Array< { css: string } >;
}

const ItemPreview = ( {
	item,
	index,
	clientId = null,
	onAfterClick = () => {},
	isFullLayout = false,
	isSelected = false,
	viewportWidth = 1400,
	additionalStyles = [],
}: Props ) => {
	const [ isResolved, setIsResolved ] = useState( false );
	const prevIsSelectedRef = useRef( false );

	const { getBlock, getSelectedBlockClientId } = useSelect(
		( select ) =>
			select( blockEditorStore ) as {
				getBlock: ( id: string ) => BlockData | null;
				getSelectedBlockClientId: () => string;
			},
		[]
	);
	const { selectBlock } = useDispatch( blockEditorStore );
	const { insertPatterns } = usePatterns();
	const { replaceTemplatePart } = useTemplateParts();

	// Replace all content + template parts for full-page layouts.
	const fullLayoutItemSelect = useCallback( async () => {
		const contentPatterns = item.patterns.filter(
			( p ) => ! isTemplatePartPatternSlug( p.category ?? '' )
		);

		const slugMap: Record< string, string > = {
			[ TemplatePartPatternSlug.Header ]: TemplatePartSlug.Header,
			[ TemplatePartPatternSlug.HeaderHero ]: TemplatePartSlug.HeaderHero,
			[ TemplatePartPatternSlug.Footer ]: TemplatePartSlug.Footer,
		};

		for ( const [ patternSlug, tpName ] of Object.entries( slugMap ) ) {
			const tp = item.patterns.find( ( p ) => p.category === patternSlug );
			if ( tp ) {
				await replaceTemplatePart( tpName, tp.blocks );
			}
		}

		insertPatterns( contentPatterns, null, 'replace', false );

		// Scroll to top of the canvas after replacing all content.
		const { canvasIframeDocument } = getCanvasIframeElements();
		const firstBlock = canvasIframeDocument?.querySelector( '.wp-block:first-child' );
		if ( firstBlock ) {
			// Wait for DOM to paint before scrolling.
			await new Promise( ( resolve ) => setTimeout( resolve, 300 ) );
			firstBlock.scrollIntoView( { behavior: 'auto', block: 'start' } );
		}
	}, [ insertPatterns, item.patterns, replaceTemplatePart ] );

	// Replace a single block for section-level selections.
	const singleSectionItemSelect = useCallback( async () => {
		const replaceClientId = clientId ?? getSelectedBlockClientId();
		if ( ! replaceClientId ) {
			return;
		}

		const firstPattern = item.patterns?.[ 0 ];
		if ( ! firstPattern?.blocks?.length ) {
			return;
		}

		const rootClientId = firstPattern.blocks[ 0 ]?.clientId;
		if ( ! rootClientId || getBlock( rootClientId ) ) {
			return; // pattern is already active on canvas
		}

		const templatePartSlugMap: Record< string, string > = {
			[ TemplatePartPatternSlug.Header ]: TemplatePartSlug.Header,
			[ TemplatePartPatternSlug.Footer ]: TemplatePartSlug.Footer,
		};
		const tpSlug = firstPattern.category ? templatePartSlugMap[ firstPattern.category ] : null;

		if ( tpSlug ) {
			await replaceTemplatePart( tpSlug, firstPattern.blocks );
		} else {
			insertPatterns( item.patterns, replaceClientId, 'replace' );
		}

		selectBlock( rootClientId );
		onAfterClick( rootClientId, index );
	}, [
		clientId,
		getSelectedBlockClientId,
		item.patterns,
		selectBlock,
		onAfterClick,
		index,
		getBlock,
		replaceTemplatePart,
		insertPatterns,
	] );

	// Resolve async pattern data before rendering.
	useEffect( () => {
		if ( isResolved ) {
			return;
		}
		if ( ! item.resolvers ) {
			setIsResolved( true );
			return;
		}
		Promise.all( item.resolvers.map( ( r ) => r.resolver ) ).then( () => setIsResolved( true ) );
	}, [ item, isResolved ] );

	// Flatten patterns into previewable blocks.
	const shownPatterns = useMemo( () => {
		if ( ! isResolved || ! Array.isArray( item?.patterns ) ) {
			return [];
		}

		const patterns: Pattern[] = JSON.parse( JSON.stringify( item.patterns ) );

		const headerPattern = patterns.find( ( p ) => p.category === TemplatePartPatternSlug.Header );
		const heroPattern = patterns.find( ( p ) => p.category === TemplatePartPatternSlug.HeaderHero );

		// Inline the header pattern inside the hero's `core/template-part` placeholder.
		if ( heroPattern && headerPattern ) {
			const inlineHeader = ( blocks: BlockData[] ): BlockData[] =>
				blocks.map( ( block ) => {
					if (
						block.name === 'core/template-part' &&
						block.attributes?.slug === TemplatePartSlug.Header
					) {
						return headerPattern.blocks[ 0 ];
					}
					if ( block.innerBlocks ) {
						return { ...block, innerBlocks: inlineHeader( block.innerBlocks ) };
					}
					return block;
				} );
			heroPattern.blocks = inlineHeader( heroPattern.blocks );
		}

		return patterns
			.filter( ( p ) => p?.blocks?.length )
			.filter( ( p ) => {
				// Hide the standalone header when a hero exists.
				if ( p.category === TemplatePartPatternSlug.Header ) {
					return ! patterns.some( ( q ) => q.category === TemplatePartPatternSlug.HeaderHero );
				}
				return true;
			} )
			.map( ( p ) => ( { ...p, blocks: unsetNavigationBlockMobileLayout( p.blocks ) } ) )
			.map( ( p ) => p.blocks[ 0 ] )
			.slice( 0, MAX_SHOWN_PATTERNS );
	}, [ item?.patterns, isResolved ] );

	const onItemSelect = useCallback( () => {
		if ( isFullLayout ) {
			fullLayoutItemSelect();
		} else {
			singleSectionItemSelect();
		}
	}, [ isFullLayout, fullLayoutItemSelect, singleSectionItemSelect ] );

	// Auto-select when the parent carousel navigates to this item.
	useEffect( () => {
		if ( isSelected && isResolved && ! prevIsSelectedRef.current ) {
			prevIsSelectedRef.current = true;
			onItemSelect();
		} else if ( ! isSelected ) {
			prevIsSelectedRef.current = false;
		}
	}, [ isSelected, isResolved, onItemSelect ] );

	if ( ! isResolved ) {
		return (
			<div className="agents-manager-pattern-picker__item-preview agents-manager-pattern-picker__item-preview--loading">
				<Spinner />
			</div>
		);
	}

	return (
		<div
			className="agents-manager-pattern-picker__item-preview"
			onClick={ onItemSelect }
			onKeyDown={ ( e ) => {
				if ( e.key === 'Enter' || e.key === ' ' ) {
					e.preventDefault();
					onItemSelect();
				}
			} }
			role="button"
			tabIndex={ 0 }
		>
			<BlockPreview
				blocks={ shownPatterns }
				viewportWidth={ viewportWidth }
				additionalStyles={ additionalStyles }
			/>
		</div>
	);
};

export default memo( ItemPreview );

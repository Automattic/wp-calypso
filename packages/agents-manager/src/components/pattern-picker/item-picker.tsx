import { store as blockEditorStore } from '@wordpress/block-editor';
import { Button } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { memo, useCallback, useEffect, useMemo, useState } from '@wordpress/element';
import { addAction, removeAction } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import useEmblaCarousel from 'embla-carousel-react';
import { CHECKPOINT_RESTORED_ACTION } from '../../hooks/use-checkpoint';
import { getCanvasIframeElements } from '../../utils/canvas-iframe-elements';
import {
	isTemplatePartPatternSlug,
	TemplatePartPatternSlug,
	TemplatePartSlug,
} from '../../utils/template-parts';
import ItemPreview from './item-preview';
import type { Layout } from './types';

const VIEWPORT_WIDTH_HEADER = 700;
const VIEWPORT_WIDTH_TEMPLATE_PART = 1000;
const VIEWPORT_WIDTH_DEFAULT = 1400;

const LOGO_CSS_PROPERTIES = [ '--site-logo-url', '--site-logo-object-position' ];
const RESTORE_NAMESPACE = 'agents-manager/item-picker';

interface Props {
	items: Layout[];
	clientId?: string;
	isFullLayout?: boolean;
	isHeroPattern?: boolean;
}

const ItemPicker = ( { items, clientId, isFullLayout = false, isHeroPattern = false }: Props ) => {
	const [ emblaRef, emblaApi ] = useEmblaCarousel( {
		axis: 'x',
		align: 'start',
		containScroll: 'trimSnaps',
		dragFree: false,
		watchDrag: false,
		slidesToScroll: 1,
	} );
	const [ canScrollPrev, setCanScrollPrev ] = useState( false );
	const [ canScrollNext, setCanScrollNext ] = useState( false );
	const [ isScrolling, setIsScrolling ] = useState( false );
	const [ selectedIndex, setSelectedIndex ] = useState< number | null >( null );
	const [ replaceId, setReplaceId ] = useState( clientId );

	const { getBlocks } = useSelect(
		( select ) =>
			select( blockEditorStore ) as {
				getBlocks: (
					rootClientId?: string
				) => Array< { clientId: string; name?: string; attributes?: Record< string, unknown > } >;
			},
		[]
	);

	// Reset `replaceId` when a checkpoint is restored so the next selection
	// targets the correct (possibly re-created) block.
	useEffect( () => {
		const handleRestore = () => {
			if ( isHeroPattern ) {
				const tp = getBlocks().find(
					( b ) =>
						b.name === 'core/template-part' && b.attributes?.slug === TemplatePartSlug.HeaderHero
				);
				const heroBlocks = tp ? getBlocks( tp.clientId ) : [];
				setReplaceId( heroBlocks[ 0 ]?.clientId );
			} else {
				setReplaceId( clientId );
			}
		};

		removeAction( CHECKPOINT_RESTORED_ACTION, RESTORE_NAMESPACE );
		addAction( CHECKPOINT_RESTORED_ACTION, RESTORE_NAMESPACE, handleRestore );
		return () => {
			removeAction( CHECKPOINT_RESTORED_ACTION, RESTORE_NAMESPACE );
		};
	}, [ clientId, getBlocks, isHeroPattern ] );

	// Compute layout-aware config: CSS class, viewport width, and site logo styles.
	const layoutConfig = useMemo( () => {
		const categories = new Set( items.map( ( item ) => item?.patterns?.[ 0 ]?.category ) );
		let className = 'agents-manager-pattern-picker__slides';
		let viewportWidth = VIEWPORT_WIDTH_DEFAULT;

		if ( categories.size === 1 ) {
			const category = [ ...categories.values() ][ 0 ];
			if ( isTemplatePartPatternSlug( category ?? '' ) ) {
				className += ' agents-manager-pattern-picker__slides--wider';
				viewportWidth =
					category === TemplatePartPatternSlug.Header
						? VIEWPORT_WIDTH_HEADER
						: VIEWPORT_WIDTH_TEMPLATE_PART;
			}
		}

		// Read site logo CSS vars from the canvas iframe for pattern previews.
		const { canvasIframeRoot } = getCanvasIframeElements();
		let additionalStyles: Array< { css: string } > = [];
		if ( canvasIframeRoot ) {
			const computed = window.getComputedStyle( canvasIframeRoot );
			const cssProps = LOGO_CSS_PROPERTIES.map(
				( prop ) => `${ prop }: ${ computed.getPropertyValue( prop ) || ' ' };`
			);
			additionalStyles = [ { css: `html { ${ cssProps.join( ' ' ) } }` } ];
		}

		return { className, viewportWidth, additionalStyles };
	}, [ items ] );

	const filteredItems = useMemo(
		() => items?.filter( ( item ) => ! item.isPlaceholder && item.patterns?.length > 0 ) || [],
		[ items ]
	);

	const onSelect = useCallback( () => {
		if ( ! emblaApi ) {
			return;
		}
		setCanScrollPrev( emblaApi.canScrollPrev() );
		setCanScrollNext( emblaApi.canScrollNext() );
	}, [ emblaApi ] );

	useEffect( () => {
		if ( ! emblaApi ) {
			return;
		}
		onSelect();
		emblaApi.on( 'select', onSelect );
		emblaApi.on( 'reInit', onSelect );
		return () => {
			emblaApi.off( 'select', onSelect );
			emblaApi.off( 'reInit', onSelect );
		};
	}, [ emblaApi, onSelect ] );

	useEffect( () => {
		if ( ! emblaApi ) {
			return;
		}
		const onSettle = () => setIsScrolling( false );
		emblaApi.on( 'settle', onSettle );
		return () => {
			emblaApi.off( 'settle', onSettle );
		};
	}, [ emblaApi ] );

	const scrollPrev = useCallback( () => {
		if ( emblaApi && ! isScrolling ) {
			setIsScrolling( true );
			emblaApi.scrollPrev();
			setSelectedIndex( emblaApi.selectedScrollSnap() );
		}
	}, [ emblaApi, isScrolling ] );

	const scrollNext = useCallback( () => {
		if ( emblaApi && ! isScrolling ) {
			setIsScrolling( true );
			emblaApi.scrollNext();
			setSelectedIndex( emblaApi.selectedScrollSnap() );
		}
	}, [ emblaApi, isScrolling ] );

	const handleAfterClick = useCallback( ( id: string, index: number ) => {
		setReplaceId( id );
		setSelectedIndex( index );
	}, [] );

	if ( ! filteredItems.length ) {
		return null;
	}

	return (
		<div className="agents-manager-pattern-picker__item-picker">
			<div className="agents-manager-pattern-picker__embla" ref={ emblaRef }>
				<div className={ layoutConfig.className }>
					{ filteredItems.map( ( item, index ) => (
						<div key={ item.id } className="agents-manager-pattern-picker__slide">
							<ItemPreview
								index={ index }
								item={ item }
								clientId={ replaceId }
								onAfterClick={ handleAfterClick }
								isFullLayout={ isFullLayout }
								isSelected={ selectedIndex === index }
								viewportWidth={ layoutConfig.viewportWidth }
								additionalStyles={ layoutConfig.additionalStyles }
							/>
						</div>
					) ) }
				</div>
			</div>
			{ filteredItems.length > 1 && (
				<div className="agents-manager-pattern-picker__arrows">
					<Button
						label={ __( 'Previous', '__i18n_text_domain__' ) }
						icon={ chevronLeft }
						onClick={ scrollPrev }
						disabled={ ! canScrollPrev || isScrolling }
						size="compact"
					/>
					<div className="agents-manager-pattern-picker__pager">
						{ ( selectedIndex ?? 0 ) + 1 }/{ filteredItems.length }
					</div>
					<Button
						label={ __( 'Next', '__i18n_text_domain__' ) }
						icon={ chevronRight }
						onClick={ scrollNext }
						disabled={ ! canScrollNext || isScrolling }
						size="compact"
					/>
				</div>
			) }
		</div>
	);
};

export default memo( ItemPicker );

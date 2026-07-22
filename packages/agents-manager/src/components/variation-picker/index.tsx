import {
	Button,
	__experimentalGrid as Grid,
	Tooltip,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';
import { memo, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import Variation from './variation';
import type { StyleVariation } from '../styles-preview';
import './style.scss';

// Variations per page — one full 2×2 grid in the docked sidebar.
const DEFAULT_MAX_TO_SHOW = 4;

// Mirror the grid: the 140px track minimum in `GRID_TEMPLATE_COLUMNS` and the
// 8px gap from the Grid's `gap={ 2 }` (4px base).
const CARD_MIN_WIDTH = 140;
const GRID_GAP = 8;

// Rows per page when the width fits more than the narrow two columns.
const PAGE_ROWS = 2;

// The most columns possible under the 640px width cap — at full width every
// option renders without pagination.
const FULL_WIDTH_COLUMNS = 4;

// As many card-sized columns as fit, but at least 2 — `min()` caps the track
// minimum at half the row so the narrow docked chat never falls to one column,
// and `auto-fill` keeps empty tracks so partial pages don't stretch their cards.
const GRID_TEMPLATE_COLUMNS = 'repeat(auto-fill, minmax(min(140px, calc(50% - 4px)), 1fr))';

interface Props {
	variations: StyleVariation[];
	type: 'color' | 'font' | 'button';
	maxToShow?: number;
	onSelect?: ( variation: StyleVariation ) => void;
	activeVariationTitle?: string | null;
}

function VariationPicker( { variations, type, maxToShow, onSelect, activeVariationTitle }: Props ) {
	const [ pageIndex, setPageIndex ] = useState( 0 );
	const [ width, setWidth ] = useState( 0 );
	const resizeRef = useResizeObserver( ( [ entry ] ) => setWidth( entry.contentRect.width ) );

	// `maxToShow` can arrive degenerate through model-generated tool props.
	const parsedMaxToShow = Math.floor( Number( maxToShow ) );
	const pageSize = parsedMaxToShow > 0 ? parsedMaxToShow : DEFAULT_MAX_TO_SHOW;

	// Narrow width keeps the given page size, wider widths fit at least two
	// full rows per page, and full width shows every option without pagination.
	const columns = Math.max( 2, Math.floor( ( width + GRID_GAP ) / ( CARD_MIN_WIDTH + GRID_GAP ) ) );
	const showAll = columns >= FULL_WIDTH_COLUMNS;
	const perPage = columns <= 2 ? pageSize : Math.max( pageSize, columns * PAGE_ROWS );

	const totalPages = Math.max( 1, Math.ceil( variations.length / perPage ) );
	// Resizing can shrink the page count under `pageIndex` — clamp so no
	// options get stranded behind a hidden pager.
	const page = Math.min( pageIndex, totalPages - 1 );
	const first = page * perPage;

	const variationsToShow = useMemo(
		() => ( showAll ? variations : variations.slice( first, first + perPage ) ),
		[ variations, first, perPage, showAll ]
	);

	return (
		<div className="agents-manager-variation-picker" ref={ resizeRef }>
			<VStack spacing={ 1 }>
				<Grid
					gap={ 2 }
					templateColumns={ GRID_TEMPLATE_COLUMNS }
					className="agents-manager-variation-picker__grid"
				>
					{ variationsToShow.map( ( variation, index ) => (
						// An empty `text` disables the tooltip for non-font types.
						<Tooltip key={ index } text={ type === 'font' ? variation.title : '' }>
							<div>
								<Variation
									variation={ variation }
									type={ type }
									isActive={ variation.title === activeVariationTitle }
									onSelect={ onSelect }
								/>
							</div>
						</Tooltip>
					) ) }
				</Grid>
				{ ! showAll && totalPages > 1 && (
					<div className="agents-manager-variation-picker__arrows">
						<Button
							label={ __( 'Previous', __i18n_text_domain__ ) }
							size="compact"
							icon={ chevronLeft }
							onClick={ () => setPageIndex( page - 1 ) }
							disabled={ page === 0 }
						/>
						<div className="agents-manager-variation-picker__pager">
							{ page + 1 }/{ totalPages }
						</div>
						<Button
							label={ __( 'Next', __i18n_text_domain__ ) }
							size="compact"
							icon={ chevronRight }
							onClick={ () => setPageIndex( page + 1 ) }
							disabled={ page + 1 === totalPages }
						/>
					</div>
				) }
			</VStack>
		</div>
	);
}

// The chat re-renders on every streamed token; memoizing keeps the
// iframe-preview grid off that path (all props are identity-stable).
export default memo( VariationPicker );

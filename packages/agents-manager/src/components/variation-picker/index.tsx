import {
	Button,
	__experimentalGrid as Grid,
	Tooltip,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { memo, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import Variation from './variation';
import type { StyleVariation } from '../styles-preview';
import './style.scss';

// Variations per page — one full 2×2 grid in the docked sidebar.
const DEFAULT_MAX_TO_SHOW = 4;

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
	const [ firstIndex, setFirstIndex ] = useState( 0 );

	// `maxToShow` can arrive degenerate through model-generated tool props.
	const parsedMaxToShow = Math.floor( Number( maxToShow ) );
	const perPage = parsedMaxToShow > 0 ? parsedMaxToShow : DEFAULT_MAX_TO_SHOW;

	const variationsToShow = useMemo(
		() => variations.slice( firstIndex, firstIndex + perPage ),
		[ variations, firstIndex, perPage ]
	);

	const totalPages = Math.ceil( variations.length / perPage );
	const currentPage = Math.floor( firstIndex / perPage ) + 1;

	const revealPrevious = () => {
		setFirstIndex( ( prev ) => Math.max( 0, prev - perPage ) );
	};

	const revealNext = () => {
		setFirstIndex( ( prev ) =>
			Math.min( prev + perPage, Math.floor( variations.length / perPage ) * perPage )
		);
	};

	return (
		<div className="agents-manager-variation-picker">
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
				{ variations.length > perPage && (
					<div className="agents-manager-variation-picker__arrows">
						<Button
							label={ __( 'Previous', __i18n_text_domain__ ) }
							size="compact"
							icon={ chevronLeft }
							onClick={ revealPrevious }
							disabled={ firstIndex === 0 }
						/>
						<div className="agents-manager-variation-picker__pager">
							{ currentPage }/{ totalPages }
						</div>
						<Button
							label={ __( 'Next', __i18n_text_domain__ ) }
							size="compact"
							icon={ chevronRight }
							onClick={ revealNext }
							disabled={ firstIndex + perPage >= variations.length }
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

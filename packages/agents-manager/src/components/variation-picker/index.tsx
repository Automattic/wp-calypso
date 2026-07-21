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

interface Props {
	variations: StyleVariation[];
	type: 'color' | 'font' | 'button';
	maxToShow?: number;
	onSelect?: ( variation: StyleVariation ) => void;
	activeVariationTitle?: string | null;
}

function VariationPicker( {
	variations,
	type,
	maxToShow = DEFAULT_MAX_TO_SHOW,
	onSelect,
	activeVariationTitle,
}: Props ) {
	const [ firstIndex, setFirstIndex ] = useState( 0 );

	const variationsToShow = useMemo(
		() => variations.slice( firstIndex, firstIndex + maxToShow ),
		[ variations, firstIndex, maxToShow ]
	);

	const totalPages = Math.ceil( variations.length / maxToShow );
	const currentPage = Math.floor( firstIndex / maxToShow ) + 1;

	const revealPrevious = () => {
		setFirstIndex( ( prev ) => Math.max( 0, prev - maxToShow ) );
	};

	const revealNext = () => {
		setFirstIndex( ( prev ) =>
			Math.min( prev + maxToShow, Math.floor( variations.length / maxToShow ) * maxToShow )
		);
	};

	return (
		<div className="agents-manager-variation-picker">
			<VStack spacing={ 1 }>
				{ /* `auto-fill` keeps empty tracks, so partial pages render cards at the same size instead of stretching them. */ }
				<Grid
					gap={ 2 }
					templateColumns="repeat(auto-fill, minmax(140px, 1fr))"
					className="agents-manager-variation-picker__grid"
				>
					{ variationsToShow.map( ( variation, index ) => (
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
				{ variations.length > maxToShow && (
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
							disabled={ firstIndex + maxToShow >= variations.length }
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

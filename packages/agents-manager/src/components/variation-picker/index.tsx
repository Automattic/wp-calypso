import {
	Button,
	__experimentalGrid as Grid,
	Tooltip,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import Variation from './variation';
import type { StyleVariation } from '../styles-preview';
import './style.scss';

const prepareVariations = (
	variations: StyleVariation[],
	numSuggestions: number
): StyleVariation[] => {
	const preparedVariations = variations.filter( ( v ) => v );
	if ( numSuggestions > 0 ) {
		return preparedVariations.slice( 0, numSuggestions );
	}
	return preparedVariations;
};

interface Props {
	variations: StyleVariation[];
	type: 'color' | 'font' | 'button';
	maxToShow?: number;
	numSuggestions?: number;
	onSelect?: ( variation: StyleVariation ) => void;
	onPaginate?: ( direction: 'prev' | 'next' ) => void;
	activeVariationTitle?: string | null;
	currentStyleVariation?: StyleVariation | null;
	fontFamiliesToCSS?: ( fontFamilies: Array< { name: string; fontFamily: string } > ) => string;
}

export default function VariationPicker( {
	variations,
	type,
	maxToShow = 4,
	numSuggestions = 0,
	onSelect,
	onPaginate,
	activeVariationTitle,
	currentStyleVariation,
	fontFamiliesToCSS,
}: Props ) {
	const [ firstIndex, setFirstIndex ] = useState( 0 );

	const sortedVariations = useMemo(
		() => prepareVariations( variations, numSuggestions ),
		[ variations, numSuggestions ]
	);

	const variationsToShow = useMemo(
		() => sortedVariations.slice( firstIndex, firstIndex + maxToShow ),
		[ sortedVariations, firstIndex, maxToShow ]
	);

	const totalPages = Math.ceil( sortedVariations.length / maxToShow );
	const currentPage = Math.floor( firstIndex / maxToShow ) + 1;

	const revealPrevious = () => {
		onPaginate?.( 'prev' );
		setFirstIndex( ( prev ) => Math.max( 0, prev - maxToShow ) );
	};

	const revealNext = () => {
		onPaginate?.( 'next' );
		setFirstIndex( ( prev ) =>
			Math.min( prev + maxToShow, Math.floor( sortedVariations.length / maxToShow ) * maxToShow )
		);
	};

	if ( ! sortedVariations.length ) {
		return (
			<div>
				{ __(
					'There was a problem retrieving options. Please try again.',
					'__i18n_text_domain__'
				) }
			</div>
		);
	}

	return (
		<div className="agents-manager-variation-picker">
			<VStack spacing={ 1 }>
				<Grid gap={ 2 } columns={ 2 } className="agents-manager-variation-picker__grid">
					{ variationsToShow.map( ( variation, index ) => (
						<Tooltip key={ index } text={ type === 'font' ? variation.title : '' }>
							<div>
								<Variation
									variation={ variation }
									type={ type }
									isActive={ variation.title === activeVariationTitle }
									onSelect={ onSelect }
									currentStyleVariation={ currentStyleVariation }
									fontFamiliesToCSS={ fontFamiliesToCSS }
								/>
							</div>
						</Tooltip>
					) ) }
				</Grid>
				{ sortedVariations.length > maxToShow && (
					<div className="agents-manager-variation-picker__arrows">
						<Button
							label={ __( 'Previous', '__i18n_text_domain__' ) }
							size="compact"
							icon={ chevronLeft }
							onClick={ revealPrevious }
							disabled={ firstIndex === 0 }
						/>
						<div className="agents-manager-variation-picker__pager">
							{ currentPage }/{ totalPages }
						</div>
						<Button
							label={ __( 'Next', '__i18n_text_domain__' ) }
							size="compact"
							icon={ chevronRight }
							onClick={ revealNext }
							disabled={ firstIndex + maxToShow >= sortedVariations.length }
						/>
					</div>
				) }
			</VStack>
		</div>
	);
}

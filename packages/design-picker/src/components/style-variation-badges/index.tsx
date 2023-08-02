import { useMemo } from 'react';
import { DEFAULT_GLOBAL_STYLES_VARIATION_SLUG } from '../../constants';
import { isDefaultGlobalStylesVariationSlug } from '../../utils';
import Badge from './badge';
import type { StyleVariation } from '../../types';
import './style.scss';

const SPACE_BAR_KEYCODE = 32;

interface BadgesProps {
	maxVariationsToShow?: number;
	variations: StyleVariation[];
	onMoreClick?: () => void;
	onClick?: ( variation: StyleVariation ) => void;
	selectedVariation?: StyleVariation;
}

const Badges: React.FC< BadgesProps > = ( {
	maxVariationsToShow = 4,
	variations = [],
	onMoreClick,
	onClick,
	selectedVariation,
} ) => {
	const isSelectedVariationDefault = isDefaultGlobalStylesVariationSlug( selectedVariation?.slug );
	const variationsToShow = useMemo( () => {
		return variations.slice( 0, maxVariationsToShow );
	}, [ variations, maxVariationsToShow ] );

	return (
		<>
			{ variationsToShow.map( ( variation ) => (
				<Badge
					key={ variation.slug }
					variation={ variation }
					onClick={ onClick }
					isSelected={
						( isSelectedVariationDefault &&
							variation.slug === DEFAULT_GLOBAL_STYLES_VARIATION_SLUG ) ||
						variation.slug === selectedVariation?.slug
					}
				/>
			) ) }
			{ variations.length > variationsToShow.length && (
				<div
					className="style-variation__badge-more-wrapper"
					tabIndex={ 0 }
					role="button"
					onClick={ ( e ) => {
						if ( onMoreClick ) {
							// Prevent the event from bubbling to the the parent button.
							e.stopPropagation();
							onMoreClick();
						}
					} }
					onKeyDown={ ( e ) => {
						if ( onMoreClick && e.keyCode === SPACE_BAR_KEYCODE ) {
							// Prevent the event from bubbling to the the parent button.
							e.stopPropagation();
							e.preventDefault();
							onMoreClick();
						}
					} }
				>
					<span>{ `+${ variations.length - variationsToShow.length }` }</span>
				</div>
			) }
		</>
	);
};

export default Badges;

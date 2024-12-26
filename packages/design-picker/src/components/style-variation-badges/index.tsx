import { isStyleVariation, isDefaultVariation } from '@automattic/global-styles';
import { useMemo } from 'react';
import { DEFAULT_GLOBAL_STYLES_VARIATION_SLUG } from '../../constants';
import Badge from './badge';
import type { StyleVariation } from '../../types';
import './style.scss';

const SPACE_BAR_KEYCODE = 32;

interface BadgesProps {
	className?: string;
	maxVariationsToShow?: number;
	variations: StyleVariation[];
	onMoreClick?: () => void;
	onClick?: ( variation: StyleVariation ) => void;
	selectedVariation?: StyleVariation;
}

const Badges: React.FC< BadgesProps > = ( {
	className,
	maxVariationsToShow = 4,
	variations = [],
	onMoreClick,
	onClick,
	selectedVariation,
} ) => {
	const isSelectedVariationDefault = isDefaultVariation( selectedVariation );
	const styleVariations = useMemo(() => variations.filter( variation => isStyleVariation( variation ) ), [ variations ] );
	console.log( styleVariations );
	const variationsToShow = useMemo( () => {
		return styleVariations.slice( 0, maxVariationsToShow );
	}, [ styleVariations, maxVariationsToShow ] );

	if ( styleVariations.length === 0 ) {
		return null;
	}

	return (
		<div className={ className }>
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
			{ styleVariations.length > variationsToShow.length && (
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
					<span>{ `+${ styleVariations.length - variationsToShow.length }` }</span>
				</div>
			) }
		</div>
	);
};

export default Badges;

import { isDefaultVariation, getGroupedVariations } from '@automattic/global-styles';
import { useMemo } from 'react';
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
	maxVariationsToShow = 3,
	variations = [],
	onMoreClick,
	onClick,
	selectedVariation,
} ) => {
	const isSelectedVariationDefault = isDefaultVariation( selectedVariation );
	const { defaultVariation, styleVariations, colorVariations } = useMemo(
		() => getGroupedVariations( variations ),
		[ variations ]
	);
	// Use the color variations if the style variations are empty because we don't display color variations as palette section.
	const currentStyleVariations = styleVariations.length > 0 ? styleVariations : colorVariations;
	const variationsToShow = useMemo( () => {
		return currentStyleVariations.slice( 0, maxVariationsToShow );
	}, [ currentStyleVariations, maxVariationsToShow ] );

	if ( currentStyleVariations.length === 0 ) {
		return null;
	}

	return (
		<div className={ className }>
			{ defaultVariation && (
				<Badge
					key="base"
					variation={ defaultVariation }
					onClick={ onClick }
					isSelected={ isSelectedVariationDefault }
				/>
			) }
			{ variationsToShow.map( ( variation ) => (
				<Badge
					key={ variation.slug }
					variation={ variation }
					onClick={ onClick }
					isSelected={ variation.slug === selectedVariation?.slug }
				/>
			) ) }
			{ currentStyleVariations.length > variationsToShow.length && (
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
					<span>{ `+${ currentStyleVariations.length - variationsToShow.length }` }</span>
				</div>
			) }
		</div>
	);
};

export default Badges;

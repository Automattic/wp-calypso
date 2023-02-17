import { useEffect, useMemo, useState } from 'react';
import Badge from './badge';
import type { StyleVariation } from '../../types';
import './style.scss';

const SPACE_BAR_KEYCODE = 32;

interface BadgesProps {
	maxVariationsToShow?: number;
	variations: StyleVariation[];
	onMoreClick?: () => void;
	onClick?: ( variation: StyleVariation ) => void;
	selectedStyleVariation?: StyleVariation;
}

const Badges: React.FC< BadgesProps > = ( {
	maxVariationsToShow = 4,
	variations = [],
	onMoreClick,
	onClick,
	selectedStyleVariation,
} ) => {
	const [ firstVariationToShow, setFirstVariationToShow ] = useState< StyleVariation >();
	useEffect( () => {
		if ( ! firstVariationToShow && selectedStyleVariation ) {
			setFirstVariationToShow( selectedStyleVariation );
		}
	}, [ selectedStyleVariation, firstVariationToShow ] );

	const variationsToShow = useMemo( () => {
		return [
			...( firstVariationToShow ? [ firstVariationToShow ] : [] ),
			...( firstVariationToShow
				? variations
						.filter( ( variation ) => variation.slug !== firstVariationToShow.slug )
						.slice( 0, maxVariationsToShow - 1 )
				: [] ),
			...( ! firstVariationToShow ? variations.slice( 0, maxVariationsToShow ) : [] ),
		];
	}, [ variations, maxVariationsToShow, firstVariationToShow ] );

	return (
		<>
			{ variationsToShow.map( ( variation ) => (
				<Badge
					key={ variation.slug }
					variation={ variation }
					onClick={ onClick }
					isSelected={
						( ! selectedStyleVariation && variation.slug === 'default' ) ||
						variation === selectedStyleVariation
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

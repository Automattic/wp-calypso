import { useMemo } from 'react';
import Badge from './badge';
import type { ThemeStyleVariation } from '../../types';
import './style.scss';

interface BadgesProps {
	maxVariationsToShow?: number;
	variations: ThemeStyleVariation[];
}

const Badges: React.FC< BadgesProps > = ( {
	maxVariationsToShow = 4,
	variations = [],
} ) => {
	const variationsToShow = useMemo(
		() => variations.slice( 0, maxVariationsToShow ),
		[ variations, maxVariationsToShow ]
	);

	return (
		<>
			{ variationsToShow.map( ( variation ) => (
				<Badge key={ variation.slug } variation={ variation } />
			) ) }
			{ variations.length > variationsToShow.length && (
				<div className="theme-style-variation__badge-more-wrapper">
					<span>{ `+${ variations.length - variationsToShow.length }` }</span>
				</div>
			) }
		</>
	);
};

export default Badges;

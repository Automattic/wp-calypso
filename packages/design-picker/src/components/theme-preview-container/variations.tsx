import { useMemo } from 'react';
import { getPreviewStylesFromVariation } from '../theme-style-variation-badges/utils';
import Variation from './variation';
import type { ThemeStyleVariation } from '../../types';

interface VariationsProps {
	variations?: ThemeStyleVariation[];
}

const Variations: React.FC< VariationsProps > = ( { variations = [] } ) => {
	const coreColors = useMemo( () => {
		const defaultVariation = variations.find( ( variation ) => variation.slug === 'default' );
		if ( ! defaultVariation ) {
			return undefined;
		}

		return getPreviewStylesFromVariation( defaultVariation );
	}, [ variations ] );

	return (
		<>
			{ variations.map( ( variation ) => (
				<div
					key={ variation.slug }
					className="theme-preview-container__variation"
					tabIndex={ 0 }
					role="button"
				>
					<Variation variation={ variation } coreColors={ coreColors } />
				</div>
			) ) }
		</>
	);
};

export default Variations;

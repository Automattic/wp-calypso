import { useMemo } from 'react';
import { getPreviewStylesFromVariation } from './utils';
import Preview from './preview';
import type { ThemeStyleVariation } from '../../types';

interface PreviewsProps {
	variations?: ThemeStyleVariation[];
}

const Previews: React.FC< PreviewsProps > = ( { variations = [] } ) => {
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
					className="theme-style-variation__preview"
					tabIndex={ 0 }
					role="button"
				>
					<Preview variation={ variation } coreColors={ coreColors } />
				</div>
			) ) }
		</>
	);
};

export default Previews;

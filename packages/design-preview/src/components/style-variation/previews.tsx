import { useMemo } from 'react';
import Preview from './preview';
import { getPreviewStylesFromVariation } from './utils';
import type { StyleVariation } from '@automattic/design-picker';
import './style.scss';

interface PreviewsProps {
	variations?: StyleVariation[];
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
					className="style-variation__preview"
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

import Variation from './variation';
import type { ThemeStyleVariation } from '../../types';

interface VariationsProps {
	variations?: ThemeStyleVariation[];
}

const Variations: React.FC< VariationsProps > = ( { variations = [] } ) => {
	return (
		<>
			{ variations.map( ( variation ) => (
				<div
					key={ variation.slug }
					className="theme-preview-container__variation"
					tabIndex={ 0 }
					role="button"
				>
					<Variation variation={ variation } />
				</div>
			) ) }
		</>
	);
};

export default Variations;

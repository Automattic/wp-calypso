import { ThemeStyleVariationPreviews } from '../theme-style-variation';
import Sidebar from './sidebar';
import type { ThemeFeature, ThemeStyleVariation } from '../../types';
import './style.scss';

interface ThemePreviewContainerProps {
	title?: string;
	description?: string;
	variations?: ThemeStyleVariation[];
	features?: ThemeFeature[];
}

const ThemePreviewContainer: React.FC< ThemePreviewContainerProps > = ( {
	title,
	description,
	variations = [],
	features,
} ) => {
	return (
		<div className="theme-preview-container">
			<Sidebar
				title={ title }
				description={ description }
				variations={ variations }
				features={ features }
			/>

			{ variations.length > 0 && (
				<div className="theme-preview-container__sticky-variations">
					<ThemeStyleVariationPreviews variations={ variations } />
				</div>
			) }
		</div>
	);
};

export default ThemePreviewContainer;

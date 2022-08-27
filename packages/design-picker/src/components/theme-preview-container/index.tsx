import Sidebar from './sidebar';
import type { ThemeStyleVariation } from '../../types';
import './style.scss';

interface ThemePreviewContainerProps {
	title?: string;
	variations?: ThemeStyleVariation[];
}

const ThemePreviewContainer: React.FC< ThemePreviewContainerProps > = ( { title, variations } ) => {
	return (
		<div className="theme-preview-container">
			<Sidebar title={ title } variations={ variations } />
		</div>
	);
};

export default ThemePreviewContainer;

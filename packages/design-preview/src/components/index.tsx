import Sidebar from './sidebar';
import type { StyleVariation, ThemeFeature } from '@automattic/design-picker';
import './style.scss';

interface PreviewProps {
	title?: string;
	description?: string;
	variations?: StyleVariation[];
	features?: ThemeFeature[];
}

const Preview: React.FC< PreviewProps > = ( { title, description, variations = [], features } ) => {
	return (
		<div className="design-preview">
			<Sidebar
				title={ title }
				description={ description }
				variations={ variations }
				features={ features }
			/>
		</div>
	);
};

export default Preview;

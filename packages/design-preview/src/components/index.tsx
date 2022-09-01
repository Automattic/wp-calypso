import Sidebar from './sidebar';
import StyleVariationPreviews from './style-variation';
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

			{ variations.length > 0 && (
				<div className="design-preview__sticky-variations">
					<StyleVariationPreviews variations={ variations } />
				</div>
			) }
		</div>
	);
};

export default Preview;

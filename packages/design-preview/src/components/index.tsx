import { useEffect } from '@wordpress/element';
import Sidebar from './sidebar';
import SitePreview from './site-preview';
import type { StyleVariation } from '@automattic/design-picker/src/types';
import './style.scss';

interface PreviewProps {
	previewUrl: string;
	title?: string;
	description?: string;
	variations?: StyleVariation[];
	selectedVariation?: StyleVariation;
	onSelectVariation: ( variation: StyleVariation ) => void;
}

const Preview: React.FC< PreviewProps > = ( {
	previewUrl,
	title,
	description,
	variations = [],
	selectedVariation,
	onSelectVariation,
} ) => {
	useEffect( () => {
		if ( variations.length > 0 && ! selectedVariation ) {
			onSelectVariation( variations[ 0 ] );
		}
	}, [ variations, selectedVariation, onSelectVariation ] );

	return (
		<div className="design-preview">
			<Sidebar
				title={ title }
				description={ description }
				variations={ variations }
				selectedVariation={ selectedVariation }
				onSelectVariation={ onSelectVariation }
			/>
			<SitePreview url={ previewUrl } inlineCss={ selectedVariation?.inline_css || '' } />
		</div>
	);
};

export default Preview;

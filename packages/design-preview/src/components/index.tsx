import { useEffect, useState } from '@wordpress/element';
import Sidebar from './sidebar';
import SitePreview from './site-preview';
import type { StyleVariation } from '@automattic/design-picker/src/types';
import './style.scss';

interface PreviewProps {
	previewUrl: string;
	title?: string;
	description?: string;
	variations?: StyleVariation[];
}

const Preview: React.FC< PreviewProps > = ( {
	previewUrl,
	title,
	description,
	variations = [],
} ) => {
	const [ activeVariation, setActiveVariation ] = useState< StyleVariation | undefined >();

	useEffect( () => {
		if ( ! activeVariation ) {
			setActiveVariation( variations[ 0 ] );
		}
	}, [ variations, activeVariation ] );

	return (
		<div className="design-preview">
			<Sidebar
				title={ title }
				description={ description }
				variations={ variations }
				activeVariation={ activeVariation }
				onVariationClick={ setActiveVariation }
			/>
			<SitePreview url={ previewUrl } inlineCss={ activeVariation?.inline_css || '' } />
		</div>
	);
};

export default Preview;

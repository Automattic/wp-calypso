import { useMemo } from '@wordpress/element';
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
	actionButtons: React.ReactNode;
}

const getVariationBySlug = ( variations: StyleVariation[], slug: string ) =>
	variations.find( ( variation ) => variation.slug === slug );

const Preview: React.FC< PreviewProps > = ( {
	previewUrl,
	title,
	description,
	variations = [],
	selectedVariation,
	onSelectVariation,
	actionButtons,
} ) => {
	const sitePreviewInlineCss = useMemo( () => {
		if ( selectedVariation ) {
			return (
				selectedVariation.inline_css ??
				( getVariationBySlug( variations, selectedVariation.slug )?.inline_css || '' )
			);
		}

		return '';
	}, [ variations, selectedVariation ] );

	return (
		<div className="design-preview">
			<Sidebar
				title={ title }
				description={ description }
				variations={ variations }
				selectedVariation={ selectedVariation }
				onSelectVariation={ onSelectVariation }
				actionButtons={ actionButtons }
			/>
			<SitePreview url={ previewUrl } inlineCss={ sitePreviewInlineCss } />
		</div>
	);
};

export default Preview;

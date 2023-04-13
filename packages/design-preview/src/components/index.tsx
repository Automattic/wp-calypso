import { useMemo } from '@wordpress/element';
import Sidebar from './sidebar';
import SitePreview from './site-preview';
import type { Category, StyleVariation } from '@automattic/design-picker/src/types';
import './style.scss';

interface PreviewProps {
	previewUrl: string;
	title?: string;
	author?: string;
	categories?: Category[];
	description?: string;
	shortDescription?: string;
	pricingBadge?: React.ReactNode;
	variations?: StyleVariation[];
	selectedVariation?: StyleVariation;
	onSelectVariation: ( variation: StyleVariation ) => void;
	onClickCategory?: ( category: Category ) => void;
	actionButtons: React.ReactNode;
	recordDeviceClick: ( device: string ) => void;
	showGlobalStylesPremiumBadge: boolean;
	patternAssemblerCTA?: React.ReactNode;
}

const INJECTED_CSS = `body{ transition: background-color 0.2s linear, color 0.2s linear; };`;

const getVariationBySlug = ( variations: StyleVariation[], slug: string ) =>
	variations.find( ( variation ) => variation.slug === slug );

const Preview: React.FC< PreviewProps > = ( {
	previewUrl,
	title,
	author,
	categories = [],
	description,
	shortDescription,
	pricingBadge,
	variations = [],
	selectedVariation,
	onSelectVariation,
	onClickCategory,
	actionButtons,
	recordDeviceClick,
	showGlobalStylesPremiumBadge,
	patternAssemblerCTA,
} ) => {
	const sitePreviewInlineCss = useMemo( () => {
		if ( selectedVariation ) {
			const inlineCss =
				selectedVariation.inline_css ??
				( getVariationBySlug( variations, selectedVariation.slug )?.inline_css || '' );

			return inlineCss + INJECTED_CSS;
		}

		return '';
	}, [ variations, selectedVariation ] );

	return (
		<div className="design-preview">
			<Sidebar
				title={ title }
				author={ author }
				categories={ categories }
				description={ description }
				shortDescription={ shortDescription }
				pricingBadge={ pricingBadge }
				variations={ variations }
				selectedVariation={ selectedVariation }
				onSelectVariation={ onSelectVariation }
				onClickCategory={ onClickCategory }
				actionButtons={ actionButtons }
				showGlobalStylesPremiumBadge={ showGlobalStylesPremiumBadge }
				patternAssemblerCTA={ patternAssemblerCTA }
			/>
			<SitePreview
				url={ previewUrl }
				inlineCss={ sitePreviewInlineCss }
				recordDeviceClick={ recordDeviceClick }
			/>
		</div>
	);
};

export default Preview;

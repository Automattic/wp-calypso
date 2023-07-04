import {
	GlobalStylesProvider,
	useGlobalStylesOutput,
	useSyncGlobalStylesUserConfig,
	transformStyles,
} from '@automattic/global-styles';
import { useMemo, useEffect } from 'react';
import Sidebar from './sidebar';
import SitePreview from './site-preview';
import type { Category, StyleVariation } from '@automattic/design-picker/src/types';
import type { GlobalStylesObject } from '@automattic/global-styles';
import './style.scss';

interface DesignPreviewProps {
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
	splitPremiumVariations: boolean;
	onClickCategory?: ( category: Category ) => void;
	actionButtons: React.ReactNode;
	recordDeviceClick: ( device: string ) => void;
	siteId: number;
	stylesheet: string;
	selectedColorVariation: GlobalStylesObject | null;
	onSelectColorVariation: ( variation: GlobalStylesObject | null ) => void;
	selectedFontVariation: GlobalStylesObject | null;
	onSelectFontVariation: ( variation: GlobalStylesObject | null ) => void;
	onGlobalStylesChange: ( globalStyles: GlobalStylesObject | null ) => void;
}

const INJECTED_CSS = `body{ transition: background-color 0.2s linear, color 0.2s linear; }`;

const getVariationBySlug = ( variations: StyleVariation[], slug: string ) =>
	variations.find( ( variation ) => variation.slug === slug );

// @todo Get the style variations of theme, and then combine the selected one with colors & fonts for consistency
const Preview: React.FC< DesignPreviewProps > = ( {
	previewUrl,
	title,
	author,
	categories = [],
	description,
	shortDescription,
	pricingBadge,
	variations,
	selectedVariation,
	onSelectVariation,
	splitPremiumVariations,
	onClickCategory,
	actionButtons,
	recordDeviceClick,
	siteId,
	stylesheet,
	selectedColorVariation,
	onSelectColorVariation,
	selectedFontVariation,
	onSelectFontVariation,
	onGlobalStylesChange,
} ) => {
	const selectedVariations = useMemo(
		() =>
			[ selectedColorVariation, selectedFontVariation ].filter( Boolean ) as GlobalStylesObject[],
		[ selectedColorVariation, selectedFontVariation ]
	);

	const syncedGlobalStylesUserConfig = useSyncGlobalStylesUserConfig( selectedVariations );

	const [ globalStyles ] = useGlobalStylesOutput();

	const sitePreviewInlineCss = useMemo( () => {
		let inlineCss = INJECTED_CSS;

		if ( globalStyles ) {
			inlineCss += transformStyles( globalStyles ).filter( Boolean ).join( '' );
		}

		if ( variations && selectedVariation ) {
			inlineCss +=
				selectedVariation.inline_css ??
				( getVariationBySlug( variations, selectedVariation.slug )?.inline_css || '' );
		}

		return inlineCss;
	}, [ variations, selectedVariation, globalStyles ] );

	useEffect( () => {
		onGlobalStylesChange( syncedGlobalStylesUserConfig );
	}, [ syncedGlobalStylesUserConfig ] );

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
				splitPremiumVariations={ splitPremiumVariations }
				onClickCategory={ onClickCategory }
				actionButtons={ actionButtons }
				siteId={ siteId }
				stylesheet={ stylesheet }
				selectedColorVariation={ selectedColorVariation }
				onSelectColorVariation={ onSelectColorVariation }
				selectedFontVariation={ selectedFontVariation }
				onSelectFontVariation={ onSelectFontVariation }
			/>
			<SitePreview
				url={ previewUrl }
				inlineCss={ sitePreviewInlineCss }
				recordDeviceClick={ recordDeviceClick }
			/>
		</div>
	);
};

const DesignPreview = ( props: DesignPreviewProps ) => (
	<GlobalStylesProvider
		siteId={ props.siteId }
		stylesheet={ props.stylesheet }
		placeholder={ null }
	>
		<Preview { ...props } />
	</GlobalStylesProvider>
);

export default DesignPreview;

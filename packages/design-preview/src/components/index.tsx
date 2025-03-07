import { GlobalStylesProvider, useSyncGlobalStylesUserConfig } from '@automattic/global-styles';
import { useViewportMatch } from '@wordpress/compose';
import clsx from 'clsx';
import { useMemo, useState } from 'react';
import { useInlineCss, useScreens } from '../hooks';
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
	selectedDesignTitle: string;
	onSelectVariation: ( variation: StyleVariation ) => void;
	splitDefaultVariation: boolean;
	needsUpgrade?: boolean;
	onClickCategory?: ( category: Category ) => void;
	actionButtons: React.ReactNode;
	recordDeviceClick: ( device: string ) => void;
	siteId: number;
	stylesheet: string;
	isVirtual?: boolean;
	screenshot?: string;
	isExternallyManaged?: boolean;
	selectedColorVariation: GlobalStylesObject | null;
	onSelectColorVariation: ( variation: GlobalStylesObject | null ) => void;
	selectedFontVariation: GlobalStylesObject | null;
	onSelectFontVariation: ( variation: GlobalStylesObject | null ) => void;
	onGlobalStylesChange: ( globalStyles?: GlobalStylesObject | null ) => void;
	limitGlobalStyles: boolean;
	onNavigatorPathChange?: ( path?: string ) => void;
	onScreenSelect?: ( screenSlug: string ) => void;
	onScreenBack?: ( screenSlug: string ) => void;
	onScreenSubmit?: ( screenSlug: string ) => void;
}

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
	splitDefaultVariation,
	needsUpgrade,
	onClickCategory,
	actionButtons,
	recordDeviceClick,
	siteId,
	stylesheet,
	screenshot,
	isVirtual,
	isExternallyManaged,
	selectedColorVariation,
	onSelectColorVariation,
	selectedFontVariation,
	onSelectFontVariation,
	onGlobalStylesChange,
	selectedDesignTitle,
	limitGlobalStyles,
	onScreenSelect,
	onScreenBack,
	onScreenSubmit,
	onNavigatorPathChange,
} ) => {
	const isDesktop = useViewportMatch( 'large' );
	const [ isInitialScreen, setIsInitialScreen ] = useState( true );
	const selectedVariations = useMemo(
		() =>
			[ selectedColorVariation, selectedFontVariation ].filter( Boolean ) as GlobalStylesObject[],
		[ selectedColorVariation, selectedFontVariation ]
	);

	const inlineCss = useInlineCss( variations, selectedVariation );

	const screens = useScreens( {
		siteId,
		stylesheet,
		isVirtual,
		isExternallyManaged,
		limitGlobalStyles,
		variations,
		splitDefaultVariation,
		needsUpgrade,
		selectedVariation,
		selectedColorVariation,
		selectedFontVariation,
		onSelectVariation,
		onSelectColorVariation,
		onSelectFontVariation,
		onScreenSelect,
		onScreenBack,
		onScreenSubmit,
	} );

	const isFullscreen = ! isDesktop && ( screens.length === 1 || ! isInitialScreen );

	const handleNavigatorPathChange = ( path?: string ) => {
		setIsInitialScreen( path === '/' );
		onNavigatorPathChange?.( path );
	};

	useSyncGlobalStylesUserConfig( selectedVariations, onGlobalStylesChange );

	return (
		<div
			className={ clsx( 'design-preview', {
				'design-preview--has-multiple-screens': screens.length > 1,
				'design-preview--is-fullscreen': isFullscreen,
			} ) }
		>
			<Sidebar
				title={ title }
				author={ author }
				categories={ categories }
				description={ description }
				shortDescription={ shortDescription }
				pricingBadge={ pricingBadge }
				screens={ screens }
				actionButtons={ actionButtons }
				onClickCategory={ onClickCategory }
				onNavigatorPathChange={ handleNavigatorPathChange }
			/>
			<SitePreview
				url={ previewUrl }
				inlineCss={ inlineCss }
				isFullscreen={ isFullscreen }
				animated={ ! isDesktop && screens.length > 0 }
				screenshot={ screenshot }
				title={ selectedDesignTitle }
				isExternallyManaged={ isExternallyManaged }
				recordDeviceClick={ recordDeviceClick }
			/>
		</div>
	);
};

const DesignPreview = ( props: DesignPreviewProps ) => {
	if ( props.isExternallyManaged ) {
		return <Preview { ...props } />;
	}

	return (
		<GlobalStylesProvider
			siteId={ props.siteId }
			stylesheet={ props.stylesheet }
			placeholder={ null }
		>
			<Preview { ...props } />
		</GlobalStylesProvider>
	);
};

export default DesignPreview;

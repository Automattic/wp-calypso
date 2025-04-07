import { GlobalStylesProvider, useSyncGlobalStylesUserConfig } from '@automattic/global-styles';
import { NavigatorScreenObject } from '@automattic/onboarding';
import { Navigator } from '@wordpress/components/build-types/navigator/types';
import { useViewportMatch } from '@wordpress/compose';
import { Element } from '@wordpress/element';
import clsx from 'clsx';
import { MutableRefObject, useMemo, useState } from 'react';
import { useInlineCss } from '../hooks';
import Sidebar from './sidebar';
import SitePreview from './site-preview';
import type { Category, StyleVariation } from '@automattic/design-picker/src/types';
import type { GlobalStylesObject } from '@automattic/global-styles';
import './style.scss';

export interface DesignPreviewProps {
	previewUrl: string;
	siteInfo?: {
		title: string;
		tagline: string;
	};
	title?: Element;
	author?: string;
	categories?: Category[];
	description?: string;
	shortDescription?: string;
	pricingBadge?: React.ReactNode;
	variations?: StyleVariation[];
	selectedVariation?: StyleVariation;
	screens: NavigatorScreenObject[];
	selectedDesignTitle: string;
	onSelectVariation: ( variation: StyleVariation ) => void;
	splitDefaultVariation: boolean;
	needsUpgrade?: boolean;
	onClickCategory?: ( category: Category ) => void;
	actionButtons: React.ReactNode;
	recordDeviceClick: ( device: string ) => void;
	siteId: number;
	stylesheet: string;
	screenshot?: string;
	isExternallyManaged?: boolean;
	selectedColorVariation: GlobalStylesObject | null;
	selectedFontVariation: GlobalStylesObject | null;
	onGlobalStylesChange: ( globalStyles?: GlobalStylesObject | null ) => void;
	onNavigatorPathChange?: ( path?: string ) => void;
	navigatorRef: MutableRefObject< Navigator | null >;
}

// @todo Get the style variations of theme, and then combine the selected one with colors & fonts for consistency
const Preview: React.FC< DesignPreviewProps > = ( {
	previewUrl,
	siteInfo,
	title,
	author,
	categories = [],
	description,
	shortDescription,
	pricingBadge,
	variations,
	selectedVariation,
	screens,
	onClickCategory,
	actionButtons,
	recordDeviceClick,
	screenshot,
	isExternallyManaged,
	selectedColorVariation,
	selectedFontVariation,
	onGlobalStylesChange,
	selectedDesignTitle,
	onNavigatorPathChange,
	navigatorRef,
} ) => {
	const isDesktop = useViewportMatch( 'large' );
	const [ isInitialScreen, setIsInitialScreen ] = useState( true );
	const selectedVariations = useMemo(
		() =>
			[ selectedColorVariation, selectedFontVariation ].filter( Boolean ) as GlobalStylesObject[],
		[ selectedColorVariation, selectedFontVariation ]
	);

	const inlineCss = useInlineCss( variations, selectedVariation );

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
				navigatorRef={ navigatorRef }
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
				siteInfo={ siteInfo }
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

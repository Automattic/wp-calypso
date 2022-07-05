import {
	getDesignPreviewUrl,
	DEFAULT_VIEWPORT_WIDTH,
	DEFAULT_VIEWPORT_HEIGHT,
	MOBILE_VIEWPORT_WIDTH,
} from '@automattic/design-picker';
import { useViewportMatch } from '@wordpress/compose';
import { useDispatch, useSelect } from '@wordpress/data';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import WebPreview from 'calypso/components/web-preview/content';
import { SITE_STORE } from '../../../../stores';
import PreviewToolbar from './preview-toolbar';
import type { GlobalStyles, SiteDetails } from '@automattic/data-stores';
import type { Design } from '@automattic/design-picker';

type PaletteColor = {
	name: string;
	color: string;
	slug?: string;
	default?: string;
};

type Palette = {
	background: PaletteColor;
	text: PaletteColor;
	link: PaletteColor;
};

interface GeneratedDesignPickerWebPreviewProps {
	site?: SiteDetails | null;
	design: Design;
	customPalette: Palette;
	locale: string;
	verticalId: string;
	isSelected: boolean;
	isPrivateAtomic?: boolean;
	isStickyToolbar?: boolean;
	recordTracksEvent: ( eventName: string, eventProperties: object ) => void;
}

const GeneratedDesignPickerWebPreview: React.FC< GeneratedDesignPickerWebPreviewProps > = ( {
	site,
	design,
	locale,
	verticalId,
	isSelected,
	isPrivateAtomic,
	isStickyToolbar,
	customPalette,
	recordTracksEvent,
} ) => {
	const translate = useTranslate();
	const isMobile = ! useViewportMatch( 'small' );
	const { getGlobalStyles } = useDispatch( SITE_STORE );
	const globalStyles: GlobalStyles = useSelect( ( select ) =>
		select( SITE_STORE ).getSiteGlobalStyles( site?.ID as number )
	);

	const themePalette = getThemePalette();
	const palettes = themePalette?.background
		? [ themePalette?.background, customPalette?.background ]
		: [];

	const onPaletteChange = ( x: string | undefined, index: number ) => {
		const activePalette = index ? customPalette : themePalette;

		const url = getDesignPreviewUrl( design, {
			language: locale,
			verticalId,
			viewport_width: isMobile ? MOBILE_VIEWPORT_WIDTH : DEFAULT_VIEWPORT_WIDTH,
			viewport_height: DEFAULT_VIEWPORT_HEIGHT,
			colors: activePalette
				? `background:${ activePalette.background.color },text:${ activePalette.text.color },link:${ activePalette.link.color }`
				: undefined,
		} );

		setPreviewUrl( url );
	};

	const [ previewUrl, setPreviewUrl ] = useState(
		getDesignPreviewUrl( design, {
			language: locale,
			verticalId,
			viewport_width: isMobile ? MOBILE_VIEWPORT_WIDTH : DEFAULT_VIEWPORT_WIDTH,
			viewport_height: DEFAULT_VIEWPORT_HEIGHT,
			colors: themePalette
				? `background:${ themePalette.background?.color },text:${ themePalette.text?.color },link:${ themePalette.link?.color }`
				: undefined,
		} )
	);

	useEffect( () => {
		site?.ID && design?.recipe?.stylesheet && getGlobalStyles( site?.ID, design.recipe.stylesheet );
	}, [ site?.ID, design?.recipe?.stylesheet ] );

	function getThemePalette(): Palette {
		const colorTheme = globalStyles?.settings.color.palette.theme.reduce(
			( sum: { [ key: string ]: PaletteColor }, palette ) => {
				sum[ palette.slug ] = palette;
				return sum;
			},
			{}
		);

		// Map color categories
		return {
			background: colorTheme?.background,
			text: colorTheme?.foreground,
			link: colorTheme?.primary,
		};
	}

	return (
		<WebPreview
			className={ classnames( { 'is-selected': isSelected } ) }
			showPreview
			showClose={ false }
			showEdit={ false }
			showDeviceSwitcher={ false }
			previewUrl={ previewUrl }
			loadingMessage={ translate( '{{strong}}One moment, please…{{/strong}} loading your site.', {
				components: { strong: <strong /> },
			} ) }
			toolbarComponent={ PreviewToolbar }
			globalStyles={ globalStyles }
			fetchPriority={ isSelected ? 'high' : 'low' }
			autoHeight
			siteId={ site?.ID }
			url={ site?.URL }
			fixedViewportWidth={ ! isMobile ? DEFAULT_VIEWPORT_WIDTH : undefined }
			isPrivateAtomic={ isPrivateAtomic }
			isStickyToolbar={ isSelected && isStickyToolbar }
			translate={ translate }
			palettes={ palettes }
			onPaletteChange={ onPaletteChange }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default GeneratedDesignPickerWebPreview;

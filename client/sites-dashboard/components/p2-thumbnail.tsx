import styled from '@emotion/styled';
import { addQueryArgs } from '@wordpress/url';
import type { SitesDisplayMode } from './sites-display-mode-switcher';
import type { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';

const LARGE_ICON_PX = 64;
const SMALL_ICON_PX = 32;
const ICON_BORDER_PX = 3;

const headerImageSize = {
	width: '100%',
	height: 'auto',
	aspectRatio: '5/2',
};

const Container = styled.div( {
	userSelect: 'none',
	position: 'relative',
	top: 0,
	left: 0,
	width: '100%',
	height: '100%',
	overflow: 'hidden',

	// Using flex to remove an unexplained gap between the header image and site icon
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'start',
} );

const HeaderImage = styled.img( {
	...headerImageSize,
	objectFit: 'cover',
} );

const ColorGradient = styled.div( {
	...headerImageSize,

	'::before': {
		content: '""',
		display: 'block',
		width: '100%',
		height: '100%',
		background: 'linear-gradient( 80.15deg, rgba( 0, 0, 0, .3 ) 0%, rgba( 0, 0, 0, 0 ) 100% )',
	},
} );

const SiteIconContainer = styled.div< { isSmall: boolean } >(
	{
		background: '#fff',
		padding: ICON_BORDER_PX,
		borderRadius: '4px',
		position: 'relative',
	},
	( { isSmall } ) =>
		isSmall
			? {
					left: '8px',
					top: `${ -SMALL_ICON_PX / 2 - ICON_BORDER_PX }px`,
			  }
			: {
					left: '32px',
					top: `${ -LARGE_ICON_PX / 2 - ICON_BORDER_PX }px`,
			  }
);

const SiteIcon = styled.img( {
	borderRadius: '2px',
	display: 'block',
} );

interface P2ThumbnailProps {
	site: SiteExcerptData;
	displayMode: SitesDisplayMode;
	alt: string;
}

export function P2Thumbnail( { site, displayMode, alt }: P2ThumbnailProps ) {
	if ( ! site.p2_thumbnail_elements ) {
		return null;
	}

	const { color_link, color_sidebar_background, header_image } = site.p2_thumbnail_elements;

	function renderContents() {
		const isSmall = displayMode === 'list';

		return (
			<>
				{ header_image ? (
					<HeaderImage { ...getHeaderImgProps( isSmall, header_image ) } />
				) : (
					<ColorGradient style={ { backgroundColor: color_link } } />
				) }
				{ site.icon && (
					<SiteIconContainer isSmall={ isSmall }>
						<SiteIcon { ...getIconImgProps( isSmall, site.icon.img ) } />
					</SiteIconContainer>
				) }
			</>
		);
	}

	return (
		<Container
			role="img"
			aria-label={ alt }
			style={ { backgroundColor: color_sidebar_background } }
		>
			{ renderContents() }
		</Container>
	);
}

function getHeaderImgProps( isSmall: boolean, imgSrc: string ) {
	if ( isSmall ) {
		return {
			src: addQueryArgs( imgSrc, { w: 106 } ),
			srcSet: addQueryArgs( imgSrc, { w: 2 * 106 } ) + ' 2x',
		};
	}

	return {
		src: imgSrc,
		srcSet: [
			addQueryArgs( imgSrc, { w: 360 } ) + ' 360w',
			addQueryArgs( imgSrc, { w: 720 } ) + ' 720w',
		].join( ',' ),
		sizes: [
			'(min-width: 1345px) 405px',
			'(min-width: 960px) calc( ( 100vw - 128px ) / 3 )',
			'(min-width: 780px) calc( ( 100vw - 96px ) / 2 )',
			'(min-width: 660px) calc( ( 100vw - 64px ) / 2 )',
			'calc( 100vw - 32px )',
		].join( ',' ),
	};
}

function getIconImgProps( isSmall: boolean, imgSrc: string ) {
	const width = isSmall ? SMALL_ICON_PX : LARGE_ICON_PX;

	return {
		src: addQueryArgs( imgSrc, { s: width } ),
		srcSet: addQueryArgs( imgSrc, { s: 2 * width } ) + ' 2x',
		width: `${ width }px`,
		height: `${ width }px`,
	};
}

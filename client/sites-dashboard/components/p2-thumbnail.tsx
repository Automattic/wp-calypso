import styled from '@emotion/styled';
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

const SiteIcon = styled.img< { isSmall: boolean } >(
	{
		borderRadius: '2px',
		display: 'block',
	},
	( { isSmall } ) =>
		isSmall
			? {
					width: SMALL_ICON_PX,
					height: SMALL_ICON_PX,
			  }
			: {
					width: LARGE_ICON_PX,
					height: LARGE_ICON_PX,
			  }
);

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
					<HeaderImage src={ header_image } alt="" />
				) : (
					<ColorGradient style={ { backgroundColor: color_link } } />
				) }
				{ site.icon && (
					<SiteIconContainer isSmall={ isSmall }>
						<SiteIcon src={ site.icon.img } alt="" isSmall={ isSmall } />
					</SiteIconContainer>
				) }
			</>
		);
	}

	return (
		<Container
			role={ 'img' }
			aria-label={ alt }
			style={ { backgroundColor: color_sidebar_background } }
		>
			{ renderContents() }
		</Container>
	);
}

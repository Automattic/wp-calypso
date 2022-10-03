import styled from '@emotion/styled';
import { useEffect } from 'react';
import image from 'calypso/assets/images/onboarding/link-in-bio-banner-large.png';
import * as Banner from './link-in-bio-banner';
import { useLinkInBioBanner } from './use-link-in-bio-banner';

const Wrapper = styled( 'div' )( {
	// this is the height of the "footer" div in `SitesGridTile`.
	// The padding here keeps the bottom of the banner and
	// the bottom of the site preview/thumbnail aligned
	paddingBottom: 70.79,
	gridColumn: 'span 2',
} );

const Root = styled( Banner.Root )( {
	alignItems: 'center',
	padding: '0 64px',
	paddingInlineEnd: 0,
	height: '100%',
	'.dismiss-button': {
		position: 'absolute',
		top: 16,
		right: 16,
		'html[dir=rtl] & ': {
			right: 'unset',
			left: 16,
		},
	},
	'.banner-image': {
		marginInlineStart: 'auto',
		height: 173,
		'html[dir=rtl] & ': {
			transform: 'scaleX(-1)',
		},
	},
	'@media screen and ( max-width: 960px )': {
		padding: 32,
		paddingInlineEnd: 0,
	},
	'@media screen and ( max-width: 1100px )': {
		'font-size': 'smaller',
		'.banner-image': {
			height: 130,
		},
	},
} );

const Details = styled( 'div' )( {
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'flex-start',
	gap: 16,
	maxWidth: 252,
} );

export const LinkInBioDoubleTileBanner = () => {
	const { handleBannerViewed } = useLinkInBioBanner();
	useEffect( handleBannerViewed, [] );
	return (
		<Wrapper>
			<Root>
				<Details>
					<Banner.Title />
					<Banner.Description />
					<Banner.CreateButton />
				</Details>
				<Banner.Image src={ image } />
				<Banner.DismissButton />
			</Root>
		</Wrapper>
	);
};

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
	paddingRight: 0,
	height: '100%',
	'.dismiss-button': {
		position: 'absolute',
		top: 16,
		right: 16,
	},
	'.banner-image': {
		marginLeft: 'auto',
		height: 173,
	},
} );

const Details = styled( 'div' )( {
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'flex-start',
	gap: 16,
	maxWidth: 252,
} );

export const LinkInBioTileStretchBanner = () => {
	const { handleBannerViewed } = useLinkInBioBanner();
	useEffect( handleBannerViewed, [] );
	return (
		<Wrapper>
			<Root>
				<Banner.DismissButton />
				<Details>
					<Banner.Title />
					<Banner.Description />
					<Banner.CreateButton />
				</Details>
				<Banner.Image src={ image } />
			</Root>
		</Wrapper>
	);
};

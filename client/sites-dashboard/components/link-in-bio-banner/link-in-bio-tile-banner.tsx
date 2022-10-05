import styled from '@emotion/styled';
import image from 'calypso/assets/images/onboarding/link-in-bio-banner-medium.png';
import * as Banner from './link-in-bio-banner-parts';

const Root = styled( Banner.Root )( {
	flexDirection: 'column',
	justifyContent: 'center',
	alignItems: 'flex-start',
	padding: 32,
	gap: 24,
	'.dismiss-button': {
		position: 'absolute',
		top: 16,
		insetInlineEnd: 16,
	},
	'.create-button': {
		width: '100%',
		justifyContent: 'center',
	},
} );

const Details = styled( 'div' )( {
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'flex-start',
	padding: 0,
	gap: 8,
} );

export const LinkInBioTileBanner = () => {
	return (
		<Root data-testid="tile-banner">
			<Banner.DismissButton />
			<Banner.Image src={ image } />
			<Details>
				<Banner.Title />
				<Banner.Description />
			</Details>
			<Banner.CreateButton />
		</Root>
	);
};

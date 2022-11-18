import styled from '@emotion/styled';
import image from 'calypso/assets/images/onboarding/link-in-bio-banner-small.jpg';
import * as Banner from './link-in-bio-banner-parts';

const Root = styled( Banner.Root )( {
	padding: 16,
	gap: 16,
	alignItems: 'center',
	'.banner-image': {
		width: 93,
	},
	'.create-button': {
		whiteSpace: 'nowrap',
	},
	[ '@media screen and ( max-width: 960px )' ]: {
		'.banner-image': {
			display: 'none',
		},
	},
} );

const Title = styled( Banner.Title )( {
	fontSize: '14px',
} );

const Details = styled( 'div' )( {
	display: 'flex',
	flexDirection: 'column',
	flexGrow: 1,
	gap: '8px',
} );

export const LinkInBioRowBanner = () => {
	return (
		<Root data-testid="row-banner">
			<Banner.Image src={ image } />
			<Details>
				<Title />
				<Banner.Description />
			</Details>
			<Banner.CreateButton />
		</Root>
	);
};

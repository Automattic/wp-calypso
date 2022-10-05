//todo use variables where possible and check fontSize use in code base to make sure consistent
import { recordTracksEvent } from '@automattic/calypso-analytics';
import styled from '@emotion/styled';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { close } from '@wordpress/icons';
import { ComponentProps } from 'react';
import { useDispatch } from 'react-redux';
import { savePreference } from 'calypso/state/preferences/actions';

export const LINK_IN_BIO_BANNER_PREFERENCE = `link-in-bio-banner`;

export const Root = styled( 'div' )( {
	position: 'relative',
	display: 'flex',
	backgroundColor: '#D0CCE3',
	borderRadius: '3px',
} );

export const Title = styled( 'h3' )( {
	fontWeight: 500,
	fontSize: 20,
	color: '#000000',
	margin: 0,
} );

Title.defaultProps = { children: __( 'Your digital identity' ) };

export const Description = styled( 'p' )( {
	margin: 0,
} );

Description.defaultProps = {
	children: __( 'Show the world what you have to offer with a Link to Bio site.' ),
};

export const DismissButton = ( props: ComponentProps< typeof Button > ) => {
	const dispatch = useDispatch();

	const handleDismissBanner = () => {
		recordTracksEvent( 'calypso_link_in_bio_banner_dismiss_click' );
		dispatch( savePreference( LINK_IN_BIO_BANNER_PREFERENCE, false ) );
	};
	return (
		<Button
			icon={ close }
			onClick={ handleDismissBanner }
			{ ...props }
			className="dismiss-button"
		/>
	);
};

export const Image = ( { src }: { src: string } ) => {
	return <img src={ src } alt={ __( 'Link to Bio banner image' ) } className={ 'banner-image' } />;
};

const handleBannerCtaClick = () => {
	recordTracksEvent( 'calypso_link_in_bio_banner_cta_click' );
};

export const CreateButton = () => {
	return (
		<Button
			isPressed
			href="/setup/intro?flow=link-in-bio&ref=logged-out-homepage-lp"
			className="create-button"
			onClick={ handleBannerCtaClick }
		>
			{ __( 'Create your bio site' ) }
		</Button>
	);
};

export const handleBannerViewed = () => {
	recordTracksEvent( 'calypso_link_in_bio_banner_viewed' );
};

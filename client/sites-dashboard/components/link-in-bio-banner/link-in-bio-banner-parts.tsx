import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@automattic/components';
import styled from '@emotion/styled';
import { Button as IconButton } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { close } from '@wordpress/icons';
import { useEffect } from 'react';
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

export const DismissButton = () => {
	const dispatch = useDispatch();

	const handleDismissBanner = () => {
		recordTracksEvent( 'calypso_link_in_bio_banner_dismiss_click' );
		dispatch( savePreference( LINK_IN_BIO_BANNER_PREFERENCE, false ) );
	};
	return <IconButton icon={ close } onClick={ handleDismissBanner } className="dismiss-button" />;
};

export const Image = ( { src }: { src: string } ) => {
	return <img src={ src } alt={ __( 'Link to Bio banner image' ) } className="banner-image" />;
};

const handleBannerCtaClick = () => {
	recordTracksEvent( 'calypso_link_in_bio_banner_cta_click' );
};

export const handleBannerViewed = () => {
	recordTracksEvent( 'calypso_link_in_bio_banner_viewed' );
};

// Based on steps-repository/intro/styles.scss and entry-stepper.css
// which are used for flow `/setup/intro`. We should probably have
// a ready-made button in this style.
const LinkButton = styled( Button )( {
	color: 'var(--studio-gray-0)',
	backgroundColor: 'var(--studio-gray-100)',
	fontWeight: 500,
	letterSpacing: '0.32px',
	padding: '10px 24px',
	border: 'none',
	boxShadow: 'none',
	flexShrink: 0,
	'&:visited': {
		color: 'var(--studio-gray-0)',
	},
	'&:hover': {
		backgroundColor: 'var(--studio-gray-70)',
		color: 'var(--studio-gray-0)',
	},
	'&:focus': {
		backgroundColor: 'var(--studio-gray-70)',
		color: 'var(--studio-gray-0)',
		outline: 'solid 2px var(--studio-gray-70)',
		outlineOffset: 2,
		boxShadow: 'none !important',
	},
} );

export const CreateButton = () => {
	useEffect( handleBannerViewed, [] );
	return (
		<LinkButton
			href="/setup/intro?flow=link-in-bio&ref=sites-dashboard"
			className="create-button"
			onClick={ handleBannerCtaClick }
		>
			{ __( 'Create your bio site' ) }
		</LinkButton>
	);
};

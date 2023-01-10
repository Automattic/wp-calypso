import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@automattic/components';
import styled from '@emotion/styled';
import { __ } from '@wordpress/i18n';
import { useEffect } from 'react';

export const Root = styled( 'div' )( {
	position: 'relative',
	display: 'flex',
	backgroundColor: '#D9D7E6',
} );

export const Title = styled( 'h3' )( {
	fontWeight: 500,
	fontSize: 20,
	color: 'var(--studio-gray-100)',
	margin: 0,
} );

Title.defaultProps = { children: __( 'Stand out' ) };

export const Description = styled( 'p' )( {
	margin: 0,
	fontSize: '14px',
} );

Description.defaultProps = {
	children: __( 'All of your links in one beautiful, shareable site.' ),
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
			{ __( 'Launch a link in bio' ) }
		</LinkButton>
	);
};

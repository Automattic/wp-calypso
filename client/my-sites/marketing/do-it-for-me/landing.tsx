import { Button, Card } from '@automattic/components';
import styled from '@emotion/styled';
import page from 'page';
import React from 'react';
import { useSelector } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import FormattedHeader from 'calypso/components/formatted-header';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const VerticalsGrid = styled.div`
	display: grid;
	grid-template-columns: repeat( 3, 1fr );
	gap: 2em;
	@media ( max-width: 960px ) {
		grid-template-columns: 1fr;
	}
`;

export default function DoItForMeLandingPage(): JSX.Element {
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );

	const onInterestedSelected = async () => {
		page( `/marketing/do-it-for-me/site-info/${ selectedSiteSlug }` );
	};

	return (
		<Card>
			<FormattedHeader
				brandFont
				headerText="Your Site Built By Wordpress"
				subHeaderText="You want the website of your dreams. Our experts can create it for you."
				align="left"
			/>
			<img
				src="https://wpcom.files.wordpress.com/2020/10/built-by-hero-image.png"
				width="100%"
				alt="WordPress logo"
			/>

			<CardHeading tagName="h5" size={ 24 }>
				Our website building plans are perfect for:
			</CardHeading>

			<VerticalsGrid>
				<div>
					<CardHeading tagName="h1" size={ 21 }>
						Online Stores
					</CardHeading>
					<p>
						Turn your website into an online store with everything you need to sell your products,
						ideas, or services. Easily accept one-time or recurring payments, reach your customers,
						and design your site so it stands apart — and converts more.
					</p>
				</div>
				<div>
					<CardHeading tagName="h1" size={ 21 }>
						Educational Websites
					</CardHeading>
					<p>
						Whether you’re creating webinars, podcasts, online courses, or more, we can help you
						create a single platform that helps you connect with your audience, build a following,
						and earn an income from your content.
					</p>
				</div>
				<div>
					<CardHeading tagName="h1" size={ 21 }>
						Professional Services
					</CardHeading>
					<p>
						Launch and grow your business with a professional design that helps you stand out,
						marketing tools to help you reach your customers, and the functionality you need to keep
						growing.
					</p>
				</div>
			</VerticalsGrid>

			<Button primary onClick={ onInterestedSelected }>
				I am interested
			</Button>
		</Card>
	);
}

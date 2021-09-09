import { Card } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import React from 'react';
import { useSelector } from 'react-redux';
import IT from 'calypso/assets/images/difm/IT-1.png';
import consult1 from 'calypso/assets/images/difm/consult-1.png';
import consult2 from 'calypso/assets/images/difm/consult-2.png';
import dietician from 'calypso/assets/images/difm/dietician-1.png';
import musician from 'calypso/assets/images/difm/musician-1.png';
import photography from 'calypso/assets/images/difm/photography-1.png';
import phsych from 'calypso/assets/images/difm/phsych-1.png';
import restaurant from 'calypso/assets/images/difm/restaurant-1.png';
import treeremoval from 'calypso/assets/images/difm/tree-removal.png';
import { FullWidthButton } from 'calypso/my-sites/marketplace/components';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const VerticalsGrid = styled.div`
	display: grid;
	grid-template-columns: repeat( 3, 1fr );
	gap: 0.75em;
	text-align: center;
	@media ( max-width: 960px ) {
		grid-template-columns: 1fr;
	}
`;

const Vertical = styled.h1`
	margin-bottom: 16px;
	padding: 16px 20px;
	margin: 0 auto 10px;
	padding: 16px;
`;

const VerticalHeading = styled.h1`
	font-size: 1.25rem;
	text-align: center;
	margin: 1em 0 1em 0;
	height: 4.25em;
	border-bottom: 1px solid var( --color-border-subtle );
	box-sizing: border-box;
`;

const ImageContainer = styled.div`
	height: 150px;
	overflow: hidden;
	margin: 10px 0px;
	@media ( min-width: 960px ) {
		height: auto;
	}
`;

const ButtonContainer = styled.div`
	width: 100%;
	@media ( min-width: 480px ) {
		margin: 0 15px;
		width: 200px;
	}
`;

const Paragraph = styled.p`
	margin: 16px;
	font-size: 1rem;
	text-align: justify;
`;

const Heading = styled.h2`
	font-size: 1.5rem;
	margin: 15px 15px 0;
	padding: 0;
`;

export default function DoItForMeLandingPage(): JSX.Element {
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const translate = useTranslate();
	const currencyCode = useSelector( ( state ) => getCurrentUserCurrencyCode( state ) ) ?? 'USD';
	const displayCost = formatCurrency( 150, currencyCode, { stripZeros: true } );

	const onInterestedSelected = async () => {
		page( `/marketing/do-it-for-me/site-info/${ selectedSiteSlug }` );
	};

	return (
		<Card>
			<Heading className="do-it-for-me__header formatted-header__title wp-brand-font">
				{ translate( 'Your Site Built By WordPress.com' ) }
			</Heading>

			<Paragraph>
				{ translate(
					'Need a professionally designed website for your business fast? Choose from our custom-designed templates below, add your content and media, and in just 2-4 days your website will be ready to launch for just %(cost)s. The one-time fee includes a 4-page website and a 30-minute Quick Start Zoom orientation about your site when it’s complete.',
					{
						args: { cost: displayCost },
					}
				) }
			</Paragraph>
			<Paragraph>
				{ translate(
					'You’ll need to have content for 4 pages (Home, About, Contact, and one other page based on your selected template). You can add that content in the submission form.'
				) }
			</Paragraph>

			<VerticalsGrid>
				<Vertical>
					<VerticalHeading>
						{ translate( 'Professional Services' ) } <br /> { translate( 'Local Business' ) }
					</VerticalHeading>
					<VerticalsGrid>
						<ImageContainer>
							<img src={ consult1 } width="100%" alt="WordPress logo" />
						</ImageContainer>
						<ImageContainer>
							<img src={ consult2 } width="100%" alt="WordPress logo" />
						</ImageContainer>
						<ImageContainer>
							<img src={ treeremoval } width="100%" alt="WordPress logo" />
						</ImageContainer>
					</VerticalsGrid>
				</Vertical>
				<Vertical>
					<VerticalHeading>{ translate( 'Restaurants' ) }</VerticalHeading>
					<VerticalsGrid>
						<ImageContainer>
							<img src={ restaurant } width="100%" alt="WordPress logo" />
						</ImageContainer>
						<ImageContainer>
							<img src={ dietician } width="100%" alt="WordPress logo" />
						</ImageContainer>
						<ImageContainer>
							<img src={ IT } width="100%" alt="WordPress logo" />
						</ImageContainer>
					</VerticalsGrid>
				</Vertical>
				<Vertical>
					<VerticalHeading>{ translate( 'Creatives & Portfolio' ) }</VerticalHeading>

					<VerticalsGrid>
						<ImageContainer>
							<img src={ photography } width="100%" alt="WordPress logo" />
						</ImageContainer>
						<ImageContainer>
							<img src={ musician } width="100%" alt="WordPress logo" />
						</ImageContainer>
						<ImageContainer>
							<img src={ phsych } width="100%" alt="WordPress logo" />
						</ImageContainer>
					</VerticalsGrid>
				</Vertical>
			</VerticalsGrid>
			<ButtonContainer>
				<FullWidthButton primary onClick={ onInterestedSelected }>
					{ translate( 'I am interested' ) }
				</FullWidthButton>
			</ButtonContainer>
		</Card>
	);
}

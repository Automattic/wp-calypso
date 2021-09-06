import { Button, Card } from '@automattic/components';
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
import FormattedHeader from 'calypso/components/formatted-header';
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
	margin: 2.25em 0;
	height: 4.25em;
	border-bottom: 1px solid var( --color-border-subtle );
	box-sizing: border-box;
`;

export default function DoItForMeLandingPage(): JSX.Element {
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const translate = useTranslate();

	const onInterestedSelected = async () => {
		page( `/marketing/do-it-for-me/site-info/${ selectedSiteSlug }` );
	};

	return (
		<Card>
			<FormattedHeader
				brandFont
				headerText={ translate( 'Your Site Built By WordPress' ) }
				subHeaderText={ translate(
					'You want the website of your dreams. Our experts can create it for you.'
				) }
				align="left"
			/>

			<p>
				{ translate(
					'Need a professionally designed website for your business fast? Choose from our custom designed templates below, add your content and media, and in just 1-2 days your website will be ready to launch, for just US$500. The one-time fee includes a 5-page website, a 30-minute Quick Start Zoom orientation about your site it’s complete. '
				) }
			</p>
			<p>
				{ translate(
					'You’ll need to have content for 5 pages (Home, About, Contact, and 2 other pages based on your selected template). You can add that content in the submission form.'
				) }
			</p>

			<VerticalsGrid>
				<Vertical>
					<VerticalHeading>
						{ translate( 'Professional Services' ) } <br /> { translate( 'Local Business' ) }
					</VerticalHeading>
					<VerticalsGrid>
						<div>
							<img src={ consult1 } width="100%" alt="WordPress logo" />
						</div>
						<div>
							<img src={ consult2 } width="100%" alt="WordPress logo" />
						</div>

						<div>
							<img src={ treeremoval } width="100%" alt="WordPress logo" />
						</div>
					</VerticalsGrid>
				</Vertical>
				<Vertical>
					<VerticalHeading>{ translate( 'Restaurants' ) }</VerticalHeading>
					<VerticalsGrid>
						<div>
							<img src={ restaurant } width="100%" alt="WordPress logo" />
						</div>
						<div>
							<img src={ dietician } width="100%" alt="WordPress logo" />
						</div>
						<div>
							<img src={ IT } width="100%" alt="WordPress logo" />
						</div>
					</VerticalsGrid>
				</Vertical>
				<Vertical>
					<VerticalHeading>{ translate( 'Creatives & Portfolio' ) }</VerticalHeading>

					<VerticalsGrid>
						<div>
							<img src={ photography } width="100%" alt="WordPress logo" />
						</div>
						<div>
							<img src={ musician } width="100%" alt="WordPress logo" />
						</div>
						<div>
							<img src={ phsych } width="100%" alt="WordPress logo" />
						</div>
					</VerticalsGrid>
				</Vertical>
			</VerticalsGrid>

			<Button primary onClick={ onInterestedSelected }>
				{ translate( 'I am interested' ) }
			</Button>
		</Card>
	);
}

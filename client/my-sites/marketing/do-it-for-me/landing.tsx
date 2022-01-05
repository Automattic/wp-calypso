import { WPCOM_DIFM_LITE } from '@automattic/calypso-products';
import { Card } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useSelector } from 'react-redux';
import themeGrid from 'calypso/assets/images/difm/theme-grid.png';
import verticalCreative from 'calypso/assets/images/difm/vertical-creative.png';
import verticalResturants from 'calypso/assets/images/difm/vertical-restaurants.png';
import verticalServices from 'calypso/assets/images/difm/vertical-services.png';
import { FullWidthButton } from 'calypso/my-sites/marketplace/components';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getProductCost } from 'calypso/state/products-list/selectors';
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
	margin: 0 auto 10px;
	h1 {
		font-size: 1.25rem;
		text-align: center;
		margin: 1em 0 1em 0;
		height: 4.25em;
		border-bottom: 1px solid var( --color-border-subtle );
		box-sizing: border-box;
	}
`;

const ImageContainer = styled.div`
	margin: 10px 0px;
	min-height: 15em;
	display: none;
	@media ( min-width: 960px ) {
		display: block;
	}
`;

const MobileImageContainer = styled.div`
	width: 100%;
	display: block;
	@media ( min-width: 960px ) {
		display: none;
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
	const cost = useSelector( ( state ) => getProductCost( state, WPCOM_DIFM_LITE ) ) ?? 500;
	const displayCost = formatCurrency( cost, currencyCode, { stripZeros: true } );

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
					'Need a professionally designed website for your business fast? Choose from our custom-designed templates below, add your content and media, and in just 2-4 business days your website will be ready to launch for just %(cost)s. The one-time fee includes a 4-page website.',
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
			<Paragraph>
				{ translate(
					'Want to add more pages? You can edit, add content, and modify any part of your site anytime after the build. Our Happiness team is ready to help you customize it as you wish.'
				) }
			</Paragraph>

			<VerticalsGrid>
				<Vertical>
					<h1>
						{ translate( 'Professional Services' ) } <br /> { translate( 'Local Business' ) }
					</h1>
					<MobileImageContainer>
						<img src={ verticalServices } width="100%" alt="Built By Themes" />
					</MobileImageContainer>
				</Vertical>
				<Vertical>
					<h1>{ translate( 'Restaurants' ) }</h1>
					<MobileImageContainer>
						<img src={ verticalResturants } width="100%" alt="Built By Themes" />
					</MobileImageContainer>
				</Vertical>
				<Vertical>
					<h1>{ translate( 'Creatives & Portfolio' ) }</h1>
					<MobileImageContainer>
						<img src={ verticalCreative } width="100%" alt="Built By Themes" />
					</MobileImageContainer>
				</Vertical>
			</VerticalsGrid>
			<ImageContainer>
				<img src={ themeGrid } width="100%" alt="Built By Themes" />
			</ImageContainer>
			<ButtonContainer>
				<FullWidthButton primary onClick={ onInterestedSelected }>
					{ translate( 'I am interested' ) }
				</FullWidthButton>
			</ButtonContainer>
		</Card>
	);
}

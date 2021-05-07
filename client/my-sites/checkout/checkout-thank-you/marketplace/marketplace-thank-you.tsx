/**
 * External dependencies
 */
import React from 'react';
import styled from '@emotion/styled';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import { isDesktop } from '@automattic/viewport';

/**
 * Internal dependencies
 */
import Masterbar from 'calypso/layout/masterbar/masterbar';
import Item from 'calypso/layout/masterbar/item';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import getPreviousPath from 'calypso/state/selectors/get-previous-path';
import yoastInstalledImage from 'calypso/assets/images/marketplace/yoast-installed.svg';

/**
 * style dependencies
 */
import './style.scss';

const MarketplaceThankYouContainer = styled.div`
	background-color: #fff;
`;

const MarketplaceThankYouHeader = styled.div`
    width: 100%;
    height: 240px;
    background-color: var( --studio-gray-0 );
    margin-top: var(--masterbar-height);
    display: flex;
    justify-content: center;
}`;

const MarketplaceThankyouTitle = styled.h1`
	font-size: ${ ( { subtitle = false } ) => ( subtitle ? '1.5em' : '2em' ) };
`;

const MarketplaceThankyouSection = styled.div`
    margin-bottom: 50px;
}`;

const ThankYouBody = styled.div`
	width: 100%;
	display: flex;
	justify-content: center;
	margin-top: 50px;
	> div {
		width: 460px;
	}
`;

const MarketplaceThankYou = () => {
	const selectedSite = useSelector( getSelectedSite );
	const previousPath = useSelector( getPreviousPath );
	const translate = useTranslate();
	const imageWidth = isDesktop() ? 200 : 150;

	return (
		<>
			<Masterbar>
				<Item
					icon="cross"
					onClick={ () =>
						previousPath
							? page( previousPath )
							: page(
									`/plugins/wordpress-seo${ selectedSite?.slug ? `/${ selectedSite.slug }` : '' }`
							  )
					}
					tooltip={ translate( 'Go to plugin' ) }
					tipTarget="close"
				/>
			</Masterbar>
			<MarketplaceThankYouContainer className="marketplace-thank-you__container">
				<MarketplaceThankYouHeader>
					<img alt="yoast logo" width={ imageWidth } src={ yoastInstalledImage }></img>
				</MarketplaceThankYouHeader>
				<ThankYouBody>
					<div>
						<MarketplaceThankyouSection>
							<MarketplaceThankyouTitle className="marketplace-thank-you__body-header wp-brand-font">
								{ translate( 'Yoast SEO Premium is installed' ) }
							</MarketplaceThankyouTitle>
							<p>{ translate( "You're all set. Yoast SEO is installed and ready to go." ) }</p>
						</MarketplaceThankyouSection>
						<MarketplaceThankyouSection>
							<MarketplaceThankyouTitle
								subtitle
								className="marketplace-thank-you__body-header wp-brand-font"
							>
								{ translate( 'What’s next?' ) }
							</MarketplaceThankyouTitle>
							<h3>{ translate( 'Plugin setup' ) }</h3>
							<p>
								{ translate(
									'Get to know Yoast SEO and customize it, so you can hit the ground running.'
								) }
							</p>
							<h3>{ translate( 'Start putting SEO to work' ) }</h3>
							<p>
								{ translate( "Improve your site's performance and rank higher with a few tips." ) }
							</p>
						</MarketplaceThankyouSection>
						<MarketplaceThankyouSection>
							<MarketplaceThankyouTitle
								subtitle
								className="marketplace-thank-you__body-header wp-brand-font"
							>
								{ translate( 'How can we help?' ) }
							</MarketplaceThankyouTitle>
							<p>
								{ translate(
									'Our Happiness Engineers are here if you need help, or if you have any questions.'
								) }
							</p>
						</MarketplaceThankyouSection>
					</div>
				</ThankYouBody>
			</MarketplaceThankYouContainer>
		</>
	);
};

export default MarketplaceThankYou;

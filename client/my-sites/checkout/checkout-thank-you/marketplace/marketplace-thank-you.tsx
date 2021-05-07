/**
 * External dependencies
 */
import React from 'react';
import styled from '@emotion/styled';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
/**
 * Internal dependencies
 */
import Masterbar from 'calypso/layout/masterbar/masterbar';
import Item from 'calypso/layout/masterbar/item';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import getPreviousPath from 'calypso/state/selectors/get-previous-path';

const MarketplaceThankYouContainer = styled.div`
	margin-left: -20px;
	margin-top: -20px;
	background-color: #fff;
`;

const MarketplacePurchaseHeader = styled.div`
	width: 100%;
	height: 240px;
	background-color: var( --studio-grey-0 );
`;

const MarketplaceThankYou = ( { purchases } ) => {
	const selectedSite = useSelector( getSelectedSite );
	const previousPath = useSelector( getPreviousPath );
	const translate = useTranslate();

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
				<MarketplacePurchaseHeader />
				<h1>MarketplacePurchaseDetails</h1>
				<div>{ JSON.stringify( purchases ) }</div>
			</MarketplaceThankYouContainer>
		</>
	);
};

export default MarketplaceThankYou;

import { Button } from '@automattic/components';
import { useShoppingCart } from '@automattic/shopping-cart';
import styled from '@emotion/styled';
import page from 'page';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import ActionPanel from 'calypso/components/action-panel';
import ActionPanelBody from 'calypso/components/action-panel/body';
import ActionPanelFooter from 'calypso/components/action-panel/footer';
import FormattedHeader from 'calypso/components/formatted-header';
import { fillInSingleCartItemAttributes } from 'calypso/lib/cart-values';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { getProductsList } from 'calypso/state/products-list/selectors';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const TemporaryTypeformContainer = styled.div`
	width: 95%;
	height: 18em;
	padding: 1em 0 0 1em;
	background-color: #eee;
	font-size: 2em;
	color: #b8b8b8;
`;

function SiteInformationCollection() {
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const [ isAddingToBasket, setIsAddingToBasket ] = useState( false );
	const products = useSelector( getProductsList );

	const { replaceProductsInCart } = useShoppingCart();

	const onAddDIFMProductsToCart = async () => {
		setIsAddingToBasket( true );
		const difmProduct = fillInSingleCartItemAttributes(
			{ product_slug: 'wp_difm_lite' },
			products
		);
		const premiumPlan = fillInSingleCartItemAttributes(
			{ product_slug: 'value_bundle' },
			products
		);
		await replaceProductsInCart( [ difmProduct, premiumPlan ] );
		page( `/marketing/do-it-for-me/site-info/${ selectedSiteSlug }` );
	};
	const onSubmit = async () => {
		// After Submitting typeform checkout
		await onAddDIFMProductsToCart();
		page( `/checkout/${ selectedSiteSlug }` );
	};

	return (
		<ActionPanel>
			<ActionPanelBody>
				<FormattedHeader
					brandFont
					headerText="Tell us more about your site"
					subHeaderText="We need some basic details to build your site, you will also be able to get a glimpse of what your site will look like"
					align="left"
				/>
				<TemporaryTypeformContainer>Typeform Content goes here</TemporaryTypeformContainer>
			</ActionPanelBody>
			<ActionPanelFooter>
				<Button busy={ isAddingToBasket } primary onClick={ onSubmit }>
					Checkout
				</Button>
			</ActionPanelFooter>
		</ActionPanel>
	);
}

export default function WrappedSiteInformationCollection(): JSX.Element {
	return (
		<CalypsoShoppingCartProvider>
			<SiteInformationCollection />
		</CalypsoShoppingCartProvider>
	);
}

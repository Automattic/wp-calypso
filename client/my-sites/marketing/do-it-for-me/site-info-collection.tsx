import config from '@automattic/calypso-config';
import styled from '@emotion/styled';
import { Widget } from '@typeform/embed-react';
import page from 'page';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import ActionPanel from 'calypso/components/action-panel';
import ActionPanelBody from 'calypso/components/action-panel/body';
import CardHeading from 'calypso/components/card-heading';
import FormattedHeader from 'calypso/components/formatted-header';
import Spinner from 'calypso/components/spinner';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

function getTypeformId(): string {
	return config< string >( 'difm_typeform_id' );
}

const LoadingContainer = styled.div`
	align-items: center;
	display: flex;
	flex-direction: column;
	height: 500px;
	justify-content: center;
`;

function SiteInformationCollection() {
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const username = useSelector( getCurrentUserName );
	const [ isFormSubmitted, setIsFormSubmitted ] = useState( false );

	const onSubmit = async () => {
		// After Submitting typeform checkout
		setIsFormSubmitted( true );
		page( `/checkout/${ selectedSiteSlug }/wp_difm_lite` );
	};

	return (
		<ActionPanel>
			<ActionPanelBody>
				<button onClick={ onSubmit }>NEXT </button>
				<FormattedHeader
					brandFont
					headerText={ 'Tell us more about your site' }
					subHeaderText={
						'We need some basic details to build your site, you will also be able to get a glimpse of what your site will look like'
					}
					align="left"
				/>
				{ isFormSubmitted ? (
					<LoadingContainer>
						<CardHeading tagName="h5" size={ 24 }>
							{ 'Redirecting to Checkout…' }
						</CardHeading>
						<Spinner />
					</LoadingContainer>
				) : (
					<Widget
						hidden={ {
							username,
						} }
						id={ getTypeformId() }
						style={ { width: '100%', height: '500px', padding: '1em 0 0 1em' } }
						onSubmit={ onSubmit }
						disableAutoFocus={ true }
					/>
				) }
			</ActionPanelBody>
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

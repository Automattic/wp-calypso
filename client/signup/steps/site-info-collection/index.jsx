import config from '@automattic/calypso-config';
import { WPCOM_DIFM_LITE } from '@automattic/calypso-products';
import styled from '@emotion/styled';
import { Widget } from '@typeform/embed-react';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import ActionPanel from 'calypso/components/action-panel';
import ActionPanelBody from 'calypso/components/action-panel/body';
import CardHeading from 'calypso/components/card-heading';
import FormattedHeader from 'calypso/components/formatted-header';
import Spinner from 'calypso/components/spinner';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import { getSignupDependencyStore } from 'calypso/state/signup/dependency-store/selectors';

import './style.scss';

function getTypeformId() {
	return config( 'difm_typeform_id' );
}

const LoadingContainer = styled.div`
	align-items: center;
	display: flex;
	flex-direction: column;
	height: 500px;
	justify-content: center;
`;

function SiteInformationCollection( {
	additionalStepData,
	stepName,
	submitSignupStep,
	goToNextStep,
} ) {
	const translate = useTranslate();
	const { selectedDesign } = useSelector( getSignupDependencyStore );
	const username = useSelector( getCurrentUserName );
	const [ isFormSubmitted, setIsFormSubmitted ] = useState( false );

	const nextStep = () => {
		setIsFormSubmitted( true );
		const cartItem = { product_slug: WPCOM_DIFM_LITE };
		const step = {
			stepName,
			cartItem,
		};

		submitSignupStep( step, {
			...additionalStepData,
		} );
		goToNextStep();
	};

	return (
		<ActionPanel>
			<ActionPanelBody>
				<FormattedHeader
					brandFont
					headerText={ translate( 'Tell us more about your site' ) }
					subHeaderText={ translate(
						'We need some basic details to build your site, you will also be able to get a glimpse of what your site will look like'
					) }
					align="left"
				/>
				{ isFormSubmitted ? (
					<LoadingContainer>
						<CardHeading tagName="h5" size={ 24 }>
							{ translate( 'Redirecting to Checkout…' ) }
						</CardHeading>
						<Spinner />
					</LoadingContainer>
				) : (
					<Widget
						hidden={ {
							username,
							design: selectedDesign,
						} }
						id={ getTypeformId() }
						style={ {
							width: 'calc(100% - 2px)',
							height: '50vh',
							minHeight: '745px',
							padding: '0',
							marginTop: '50px',
							border: '1px solid rgba( 220, 220, 222, 0.64 )',
							borderRadius: '4px',
						} }
						onSubmit={ nextStep }
						disableAutoFocus={ true }
					/>
				) }
			</ActionPanelBody>
		</ActionPanel>
	);
}

export default function WrappedSiteInformationCollection( props ) {
	return (
		<CalypsoShoppingCartProvider>
			<SiteInformationCollection { ...props } />
		</CalypsoShoppingCartProvider>
	);
}

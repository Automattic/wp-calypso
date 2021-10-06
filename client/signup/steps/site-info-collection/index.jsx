import config from '@automattic/calypso-config';
import { WPCOM_DIFM_LITE } from '@automattic/calypso-products';
import styled from '@emotion/styled';
import { Widget } from '@typeform/embed-react';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import Spinner from 'calypso/components/spinner';
import StepWrapper from 'calypso/signup/step-wrapper';
import { fetchCurrentUser } from 'calypso/state/current-user/actions';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import { getSignupDependencyStore } from 'calypso/state/signup/dependency-store/selectors';

import './style.scss';

function getTypeformId() {
	return config( 'difm_typeform_id' );
}
const Container = styled.div`
	@media ( max-width: 960px ) {
		margin: 0 20px 80px 20px;
	}
	@media ( max-wdith: 425px ) {
		margin-bottom: 180px;
	}
`;

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
	const dispatch = useDispatch();

	const { selectedDesign, username: signupUserName } = useSelector( getSignupDependencyStore );
	const username = useSelector( getCurrentUserName );
	const [ isFormSubmitted, setIsFormSubmitted ] = useState( false );

	useEffect( () => {
		dispatch( fetchCurrentUser() );
	}, [ dispatch ] );

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
		<Container>
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
						username: username ? username : signupUserName,
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
		</Container>
	);
}

export default function WrapperSiteInformationCollection( props ) {
	const { flowName, stepName, positionInFlow } = props;
	const translate = useTranslate();

	const headerText = translate( 'Tell us more about your site' );
	const subHeaderText = translate(
		'We need some basic details to build your site, you will also be able to get a glimpse of what your site will look like'
	);

	return (
		<StepWrapper
			headerText={ headerText }
			subHeaderText={ subHeaderText }
			fallbackHeaderText={ headerText }
			fallbackSubHeaderText={ subHeaderText }
			flowName={ flowName }
			stepName={ stepName }
			positionInFlow={ positionInFlow }
			stepContent={ <SiteInformationCollection { ...props } /> }
			goToNextStep={ false }
			hideFormattedHeader={ false }
			hideBack={ false }
			align={ 'left' }
		/>
	);
}

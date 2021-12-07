import config from '@automattic/calypso-config';
import { WPCOM_DIFM_LITE } from '@automattic/calypso-products';
import styled from '@emotion/styled';
import { Widget } from '@typeform/embed-react';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import StepWrapper from 'calypso/signup/step-wrapper';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import { getSignupDependencyStore } from 'calypso/state/signup/dependency-store/selectors';
import { saveSignupStep } from 'calypso/state/signup/progress/actions';

import './style.scss';

function getTypeformId() {
	return config( 'difm_signup_typeform_id' );
}
const Container = styled.div`
	@media ( max-width: 960px ) {
		margin: 0 20px 80px;
	}
	@media ( max-wdith: 425px ) {
		margin-bottom: 180px;
	}
`;

function SiteInformationCollection( {
	additionalStepData,
	stepName,
	submitSignupStep,
	goToNextStep,
} ) {
	const { username: signupUsername, selectedSiteCategory } = useSelector( getSignupDependencyStore );
	const dispatch = useDispatch();
	const loggedInUsername = useSelector( getCurrentUserName );
	useEffect( () => {
		dispatch( saveSignupStep( { stepName } ) );
	}, [ dispatch, stepName ] );

	const onTypeformSubmission = async ( typeformSubmissionId ) => {
		const cartItem = { product_slug: WPCOM_DIFM_LITE };
		const step = {
			stepName,
			cartItem,
			...additionalStepData,
		};
		submitSignupStep( step, {
			cartItem,
			typeformResponseId: typeformSubmissionId,
		});
		goToNextStep();
	};

	return (
		<Container>
			<button onClick={()=>onTypeformSubmission("XXXYYY")}>NEXT</button>
			<Widget
				hidden={ {
					username: signupUsername || loggedInUsername,
					vertical: selectedSiteCategory,
				} }
				id={ getTypeformId() }
				style={ {
					width: 'calc( 100% - 2px )',
					height: '50vh',
					minHeight: '745px',
					padding: '0',
					marginTop: '50px',
				} }
				onSubmit={ ( { responseId } ) => onTypeformSubmission( responseId ) }
				disableAutoFocus={ true }
			/>
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

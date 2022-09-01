import styled from '@emotion/styled';
import { localize, LocalizeProps } from 'i18n-calypso';
import { useState } from 'react';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import FormLabel from 'calypso/components/forms/form-label';

const CheckboxTermsWrapper = styled( FormLabel )< { displayErrorMessage: boolean } >`
	padding: 24px 24px 24px 59px;
	border: ${ ( props ) =>
		props.displayErrorMessage ? '3px solid var( --color-error )' : 'initial' };
	border-radius: ${ ( props ) => ( props.displayErrorMessage ? '3px' : 'initial' ) };
`;

const StyledFormCheckbox = styled( FormCheckbox )`
	// Increase specificity with && to avoid form-checkbox overriding the margin
	// Source: https://stackoverflow.com/a/64486501
	&& {
		margin: 8px 0 16px -24px;
	}
`;

const MessageWrapper = styled.div`
	font-size: 12px;
	margin-left: 0;
`;

const ErrorMessage = styled.small`
	color: var( --color-error );
	font-weight: normal;
`;

interface ExternalProps {
	isAccepted: boolean;
	isSubmitted: boolean;
	onChange: ( isAccepted: boolean ) => void;
}

type Props = ExternalProps & LocalizeProps;

function ThirdPartyDevsAccount( { isAccepted, isSubmitted, onChange, translate }: Props ) {
	const [ touched, setTouched ] = useState( false );
	const displayErrorMessage = ( isSubmitted || touched ) && ! isAccepted;

	const message = translate(
		'You agree that an account may be created on a third party developer’s site related to the products you have purchased.'
	);

	const handleChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		onChange( event.target.checked );
	};

	return (
		<CheckboxTermsWrapper displayErrorMessage={ displayErrorMessage }>
			<StyledFormCheckbox
				onChange={ handleChange }
				onBlur={ () => setTouched( true ) }
				checked={ isAccepted }
			/>
			<MessageWrapper>{ message }</MessageWrapper>
			{ displayErrorMessage && (
				<ErrorMessage>{ translate( 'The terms above need to be accepted' ) }</ErrorMessage>
			) }
		</CheckboxTermsWrapper>
	);
}

export default localize( ThirdPartyDevsAccount );

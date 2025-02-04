import { FormLabel } from '@automattic/components';
import styled from '@emotion/styled';
import { localize, LocalizeProps, TranslateResult } from 'i18n-calypso';
import { useState } from 'react';
import FormCheckbox from 'calypso/components/forms/form-checkbox';

const CheckboxTermsWrapper = styled.div`
	column-gap: 8px;
	display: grid;
	grid-template-areas:
		'checkbox message'
		'. error-message';
	grid-template-columns: 16px 1fr;
	row-gap: 4px;
	align-items: center;
	padding: 0;
	margin: 1em 0;

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		padding: 0;
	}
`;

const StyledFormCheckbox = styled( FormCheckbox )`
	grid-area: checkbox;

	// Increase specificity with && to avoid form-checkbox overriding the margin
	// Source: https://stackoverflow.com/a/64486501
	&& {
		margin: 0;
	}
`;

const MessageWrapper = styled.div< { displayErrorMessage: boolean } >`
	color: ${ ( props ) => ( props.displayErrorMessage ? 'var( --color-error )' : 'inherit' ) };
	font-size: 12px;
	grid-area: message;
	margin-left: 0;
`;

const ErrorMessage = styled.small`
	color: var( --color-error );
	font-weight: normal;
	grid-area: error-message;
`;

interface ExternalProps {
	isAccepted: boolean;
	isSubmitted: boolean;
	message: TranslateResult;
	errorMessage?: TranslateResult;
	onChange: ( isAccepted: boolean ) => void;
}

type Props = ExternalProps & LocalizeProps;

function AcceptTermsOfServiceCheckbox( {
	isAccepted,
	isSubmitted,
	message,
	errorMessage,
	onChange,
	translate,
}: Props ) {
	const [ touched, setTouched ] = useState( false );
	const displayErrorMessage = ( isSubmitted || touched ) && ! isAccepted;

	const handleChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		onChange( event.target.checked );
	};

	return (
		<FormLabel>
			<CheckboxTermsWrapper>
				<StyledFormCheckbox
					onChange={ handleChange }
					onBlur={ () => setTouched( true ) }
					checked={ isAccepted }
				/>
				<MessageWrapper displayErrorMessage={ displayErrorMessage }>{ message }</MessageWrapper>
				{ displayErrorMessage && (
					<ErrorMessage>
						{ errorMessage || translate( 'The terms above need to be accepted' ) }
					</ErrorMessage>
				) }
			</CheckboxTermsWrapper>
		</FormLabel>
	);
}

export default localize( AcceptTermsOfServiceCheckbox );

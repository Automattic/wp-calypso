import styled from '@emotion/styled';
import { localize, LocalizeProps } from 'i18n-calypso';
import FormCheckbox from 'calypso/components/forms/form-checkbox';

const CheckboxTermsWrapper = styled.div`
	padding: 24px 24px 24px 59px;
`;

const StyledFormCheckbox = styled( FormCheckbox )`
	margin: 8px 0 16px -24px;
`;

const MessageWrapper = styled.div`
	font-size: 12px;
	margin-left: 0;
`;

interface ExternalProps {
	isAccepted: boolean;
	onChange: ( isAccepted: boolean ) => void;
}

type Props = ExternalProps & LocalizeProps;

function ThirdPartyDevsAccount( { isAccepted, onChange, translate }: Props ) {
	const message = translate(
		'You agree that an account may be created on a third party developer’s site related to the products you have purchased.'
	);

	const handleChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		onChange( event.target.checked );
	};

	return (
		<CheckboxTermsWrapper>
			<StyledFormCheckbox onChange={ handleChange } checked={ isAccepted } />
			<MessageWrapper>{ message }</MessageWrapper>
		</CheckboxTermsWrapper>
	);
}

export default localize( ThirdPartyDevsAccount );

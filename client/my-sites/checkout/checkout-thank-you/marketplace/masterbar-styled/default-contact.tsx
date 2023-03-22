import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';

const ContactContainer = styled.div`
	margin-top: 24px;
	margin-right: 24px;
	font-size: 14px;
	line-height: 20px;
	font-weight: 500;

	label {
		color: var( --studio-gray-60 );
	}

	a {
		color: var( --studio-gray-100 );
		text-decoration: underline;
	}
`;

export function DefaultMasterbarContact() {
	const translate = useTranslate();

	return (
		<ContactContainer>
			<label>{ translate( 'Need extra help?' ) }</label>&nbsp;
			<a href="https://wordpress.com/support/" target="_blank" rel="noreferrer">
				{ translate( 'Ask a question' ) }
			</a>
		</ContactContainer>
	);
}

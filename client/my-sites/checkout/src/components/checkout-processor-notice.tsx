import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';

const Notice = styled.p`
	margin: 0 auto;
	padding: 24px;
	text-align: center;
	font-size: 13px;
	color: ${ ( props ) => props.theme.colors.textColorLight };
	max-width: 1280px;
	box-sizing: border-box;
`;

export default function CheckoutProcessorNotice() {
	const translate = useTranslate();
	return (
		<Notice className="checkout-processor-notice">
			{ translate(
				'Your payment will be processed by Automattic Inc. 60 29th Street #343 – San Francisco, CA 94110 – United States of America'
			) }
		</Notice>
	);
}

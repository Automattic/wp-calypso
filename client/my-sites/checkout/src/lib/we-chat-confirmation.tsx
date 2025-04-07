import { Spinner } from '@automattic/components';
import styled from '@emotion/styled';
import { formatCurrency, useTranslate } from 'i18n-calypso';
import { QRCodeSVG } from 'qrcode.react';

const WeChatConfirmationDiv = styled.dialog`
	width: 300px;
	margin: auto;
	background: white;

	.we-chat-confirmation__qrcode {
		text-align: center;
		margin-bottom: 12px;
	}

	.we-chat-confirmation__qrcode-redirect {
		color: var( --color-text-subtle );
		border-top: 1px solid var( --color-neutral-10 );
		border-bottom: 1px solid var( --color-neutral-10 );
		font-size: small;
		margin: 12px;
		padding: 15px 0;
	}
`;

export function WeChatConfirmation( {
	redirectUrl,
	priceInteger,
	priceCurrency,
}: {
	redirectUrl: string;
	priceInteger: number;
	priceCurrency: string;
} ) {
	const translate = useTranslate();

	return (
		<WeChatConfirmationDiv className="we-chat-confirmation">
			<p>
				{ translate(
					'Please scan the barcode using the WeChat Pay application to confirm your %(price)s payment.',
					{
						args: {
							price: formatCurrency( priceInteger, priceCurrency, {
								isSmallestUnit: true,
								stripZeros: true,
							} ),
						},
						comment: 'Instruction to scan a QR barcode and finalize payment with WeChat Pay.',
					}
				) }
			</p>

			<div className="we-chat-confirmation__qrcode">
				<QRCodeSVG value={ redirectUrl } />
			</div>

			<Spinner size={ 30 } />

			<p className="we-chat-confirmation__qrcode-redirect">
				{ translate(
					'On mobile? To open and pay with the WeChat Pay app directly, {{a}}click here{{/a}}.',
					{
						components: { a: <a href={ redirectUrl } /> },
						comment:
							'Asking if mobile detection has failed and they would like to open and be redirected directly into the WeChat app in order to pay.',
					}
				) }
			</p>
		</WeChatConfirmationDiv>
	);
}

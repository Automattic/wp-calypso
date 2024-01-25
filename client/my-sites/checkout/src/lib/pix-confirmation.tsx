import { Spinner } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { QRCodeSVG } from 'qrcode.react';

const ConfirmationDiv = styled.dialog`
	width: 300px;
	margin: auto;
	background: white;

	.pix-confirmation__qrcode {
		text-align: center;
		margin-bottom: 12px;
	}

	.pix-confirmation__qrcode-redirect {
		color: var( --color-text-subtle );
		border-top: 1px solid var( --color-neutral-10 );
		border-bottom: 1px solid var( --color-neutral-10 );
		font-size: small;
		margin: 12px;
		padding: 15px 0;
	}
`;

export function PixConfirmation( {
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
		<ConfirmationDiv className="pix-confirmation">
			<p>
				{ translate(
					'Please scan the barcode using the Pix application to confirm your %(price)s payment.',
					{
						args: {
							price: formatCurrency( priceInteger, priceCurrency, {
								isSmallestUnit: true,
								stripZeros: true,
							} ),
						},
						comment: 'Instruction to scan a QR barcode and finalize payment with Pix.',
					}
				) }
			</p>

			<div className="pix-confirmation__qrcode">
				<QRCodeSVG value={ redirectUrl } />
			</div>

			<Spinner size={ 30 } />

			<p className="pix-confirmation__qrcode-redirect">
				{ translate(
					'On mobile? To open and pay with the Pix app directly, {{a}}click here{{/a}}.',
					{
						components: { a: <a href={ redirectUrl } /> },
						comment:
							'Asking if mobile detection has failed and they would like to open and be redirected directly into the Pix app in order to pay.',
					}
				) }
			</p>
		</ConfirmationDiv>
	);
}

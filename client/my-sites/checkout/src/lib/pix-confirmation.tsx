import { Spinner, WordPressLogo } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { QRCodeSVG } from 'qrcode.react';

const ConfirmationDiv = styled.dialog`
	background: white;
	width: 100%;
	height: 100%;
	max-width: 100vw;
	max-height: 100vh;
	box-sizing: border-box;
	border: none;
	margin: 0;
	padding: 0;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;

	.pix-confirmation__logo {
		position: absolute;
		top: 20px;
		left: 20px;
		width: 1em;
		height: 1em;
	}

	.pix-confirmation__cancel {
		position: absolute;
		top: 20px;
		right: 20px;
	}

	.pix-confirmation__content {
		width: 400px;
	}

	.pix-confirmation__title {
		font-size: 48px;
		font-family: 'Recoleta';
		margin-bottom: 6px;
	}

	.pix-confirmation__instructions {
		font-size: 16px;
		font-weight: 400;
	}

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
	cancel,
}: {
	redirectUrl: string;
	priceInteger: number;
	priceCurrency: string;
	cancel: () => void;
} ) {
	const translate = useTranslate();

	return (
		<ConfirmationDiv className="pix-confirmation">
			<WordPressLogo className="pix-confirmation__logo" />
			<button className="pix-confirmation__cancel" onClick={ () => cancel() }>
				{ translate( 'Cancel' ) }
			</button>
			<h2 className="pix-confirmation__title">{ translate( 'Confirm your payment' ) }</h2>
			<div className="pix-confirmation__content">
				<p className="pix-confirmation__instructions">
					{ translate(
						'Please scan the QR code using the Pix application to confirm your {{strong}}%(price)s payment{{/strong}}.',
						{
							components: {
								strong: <strong />,
							},
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
			</div>
		</ConfirmationDiv>
	);
}

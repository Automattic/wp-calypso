import { WordPressLogo } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { QRCodeSVG } from 'qrcode.react';
import AkismetLogo from 'calypso/components/akismet-logo';
import JetpackLogo from 'calypso/components/jetpack-logo';

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
		height: 1em;
	}

	.pix-confirmation__cancel {
		position: absolute;
		top: 20px;
		right: 20px;
	}

	.pix-confirmation__content {
		width: 330px;
	}

	.pix-confirmation__title {
		font-size: 48px;
		font-family: 'Recoleta';
		margin-bottom: 6px;
	}

	.pix-confirmation__instructions {
		font-size: 16px;
		font-weight: 400;
		line-height: 24px;
	}

	.pix-confirmation__qrcode {
		text-align: center;
		border: 1px solid #dcdcde;
		padding: 25px;
		width: 150px;
		margin: auto;
	}

	.pix-confirmation__manual-instructions {
		margin-top: 28px;
		font-weight: 400px;
		font-size: 16px;
		line-height: 24px;
	}

	.pix-confirmation__manual-instructions a {
		text-decoration: underline;
	}

	.pix-confirmation__manual-instructions-title {
		font-weight: 500px;
		margin: 6px;
	}
`;

function CheckoutLogo( {
	isAkismet,
	isJetpackNotAtomic,
}: {
	isAkismet: boolean;
	isJetpackNotAtomic: boolean;
} ) {
	if ( isAkismet ) {
		return <AkismetLogo className="pix-confirmation__logo" />;
	}
	if ( isJetpackNotAtomic ) {
		return <JetpackLogo className="pix-confirmation__logo" />;
	}
	return <WordPressLogo className="pix-confirmation__logo" />;
}

export function PixConfirmation( {
	redirectUrl,
	priceInteger,
	priceCurrency,
	cancel,
	isAkismet,
	isJetpackNotAtomic,
}: {
	redirectUrl: string;
	priceInteger: number;
	priceCurrency: string;
	cancel: () => void;
	isAkismet: boolean;
	isJetpackNotAtomic: boolean;
} ) {
	const translate = useTranslate();

	return (
		<ConfirmationDiv className="pix-confirmation">
			<CheckoutLogo isAkismet={ isAkismet } isJetpackNotAtomic={ isJetpackNotAtomic } />
			<button className="pix-confirmation__cancel" onClick={ () => cancel() }>
				{ translate( 'Cancel' ) }
			</button>
			<h2 className="pix-confirmation__title">{ translate( 'Confirm your payment' ) }</h2>
			<div className="pix-confirmation__content">
				<p className="pix-confirmation__instructions">
					{ translate(
						'Please scan the QR code using the %(paymentMethod)s app to confirm your {{strong}}%(price)s payment{{/strong}}.',
						{
							components: {
								strong: <strong />,
							},
							args: {
								paymentMethod: 'Pix',
								price: formatCurrency( priceInteger, priceCurrency, {
									isSmallestUnit: true,
									stripZeros: true,
								} ),
							},
							comment: 'Instruction to scan a QR barcode and finalize payment with an app.',
						}
					) }
				</p>

				<div className="pix-confirmation__qrcode">
					<QRCodeSVG value={ redirectUrl } />
				</div>

				<div className="pix-confirmation__manual-instructions">
					<h3 className="pix-confirmation__manual-instructions-title">
						{ translate( 'On mobile?' ) }
					</h3>
					<p>
						{ translate( 'To open and pay with the app directly, {{a}}click here{{/a}}.', {
							components: { a: <a href={ redirectUrl } /> },
						} ) }
					</p>
				</div>
			</div>
		</ConfirmationDiv>
	);
}

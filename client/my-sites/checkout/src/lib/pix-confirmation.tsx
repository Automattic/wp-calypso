import { WordPressLogo } from '@automattic/components';
import styled from '@emotion/styled';
import { Button } from '@wordpress/components';
import { useCopyToClipboard } from '@wordpress/compose';
import { formatCurrency, useTranslate } from 'i18n-calypso';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
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
		max-width: 400px;
		padding: 0 12px;
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
		font-weight: 400;
		font-size: 16px;
		line-height: 24px;
	}

	.pix-confirmation__manual-instructions a {
		text-decoration: underline;
	}

	.pix-confirmation__manual-instructions-title {
		font-weight: 700;
		margin: 6px;
	}

	.pix-copy-code-button {
		border: 1px solid var( --color-neutral-20 );
		margin-top: 24px;
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
	qrCode,
	priceInteger,
	priceCurrency,
	cancel,
	isAkismet,
	isJetpackNotAtomic,
}: {
	qrCode: string;
	priceInteger: number;
	priceCurrency: string;
	cancel: () => void;
	isAkismet: boolean;
	isJetpackNotAtomic: boolean;
} ) {
	const translate = useTranslate();
	const [ hasCopied, setHasCopied ] = useState( false );

	const copyButtonRef = useCopyToClipboard( qrCode, () => {
		// useCopyToClipboard doesn't actually seem to work in my testing, so we
		// just copy it directly.
		navigator.clipboard.writeText( qrCode );
		setHasCopied( true );
	} );

	return (
		<ConfirmationDiv className="pix-confirmation">
			<CheckoutLogo isAkismet={ isAkismet } isJetpackNotAtomic={ isJetpackNotAtomic } />
			<button className="pix-confirmation__cancel" onClick={ () => cancel() }>
				{ translate( 'Cancel' ) }
			</button>
			<h2 className="pix-confirmation__title">{ translate( 'Pay with Pix' ) }</h2>
			<div className="pix-confirmation__content">
				<p className="pix-confirmation__instructions">
					{ translate(
						'Please scan the QR code using your banking app to complete your {{strong}}%(price)s payment{{/strong}}.',
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
							comment: 'Instruction to scan a QR barcode and finalize payment with an app.',
						}
					) }
				</p>

				<div className="pix-confirmation__qrcode">
					<QRCodeSVG value={ qrCode } />
				</div>

				<div className="pix-confirmation__manual-instructions">
					<h3 className="pix-confirmation__manual-instructions-title">
						{ translate( 'On mobile?' ) }
					</h3>
					<div>
						{ translate(
							'Choose to pay via Pix in your banking app, then copy and paste the following code into the app.'
						) }
						<div>
							<Button ref={ copyButtonRef } className="pix-copy-code-button">
								{ hasCopied ? translate( 'Copied!' ) : translate( 'Copy the Pix code' ) }
							</Button>
						</div>
					</div>
				</div>
			</div>
		</ConfirmationDiv>
	);
}

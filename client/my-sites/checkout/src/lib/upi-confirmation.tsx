import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';

const ConfirmationDialog = styled.dialog`
	width: 475px;
	max-width: 95vw;
	padding: 0;
	border: none;
	border-radius: 8px;
	overflow: hidden;
	margin: auto;

	.upi-confirmation__cancel {
		display: block;
		width: 100%;
		padding: 8px;
		background: none;
		border: none;
		border-top: 1px solid var( --color-neutral-10 );
		cursor: pointer;
		font-size: 14px;
		color: var( --color-text-subtle );

		&:hover {
			background: var( --color-neutral-0 );
		}
	}
`;

const UpiIframe = styled.iframe`
	display: block;
	width: 100%;
	height: 700px;
	border: none;
`;

export function UpiConfirmation( {
	redirectUrl,
	cancel,
}: {
	redirectUrl: string;
	cancel: () => void;
} ) {
	const translate = useTranslate();

	return (
		<ConfirmationDialog className="upi-confirmation">
			<UpiIframe src={ redirectUrl } title={ translate( 'Authorize UPI payment' ) as string } />
			<button className="upi-confirmation__cancel" onClick={ () => cancel() }>
				{ translate( 'Cancel payment' ) }
			</button>
		</ConfirmationDialog>
	);
}

import { Dialog } from '@automattic/components';
import { Button } from '@automattic/composite-checkout';
import { Global, css } from '@emotion/react';
import { useTranslate } from 'i18n-calypso';

export const CheckoutUpgradeCreditsInfoDialog = ( {
	isDialogOpen,
	onClose,
}: {
	isDialogOpen: boolean;
	onClose: () => void;
} ) => {
	const translate = useTranslate();
	return (
		<>
			<Global
				styles={ css`
					.dialog__action-buttons {
						button {
							display: inline-block;
						}
					}
				` }
			/>

			<Dialog
				isVisible={ isDialogOpen }
				onClose={ onClose }
				buttons={ [
					<Button onClick={ onClose } buttonType="primary">
						{ translate( 'Close' ) }
					</Button>,
				] }
				showCloseIcon={ true }
			>
				<>
					<h1>{ translate( 'Upgrade Credits' ) }</h1>
					<p>
						{ translate(
							'Upgrade credit allows you to use the remaining value of your current plan towards an upgrade to a higher-cost plan.'
						) }
						<br />
						{ translate(
							'Credit for the remaining time on your existing plan will automatically be applied to your upgrade. Upgrade credit cannot be applied to any other upgrade.'
						) }
					</p>
				</>
			</Dialog>
		</>
	);
};

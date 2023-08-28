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
							'Upgrade now and we’ll automatically apply the remaining credit from your current plan. Remember, upgrade credit can only be used toward plan upgrades for the same website.'
						) }
					</p>
				</>
			</Dialog>
		</>
	);
};

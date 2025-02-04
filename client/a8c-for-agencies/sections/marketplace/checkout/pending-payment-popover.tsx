import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import A4APopover from 'calypso/a8c-for-agencies/components/a4a-popover';
import { A4A_INVOICES_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';

type Props = {
	wrapperRef: React.RefObject< HTMLButtonElement >;
	hidePopover: () => void;
};

export default function PendingPaymentPopover( { wrapperRef, hidePopover }: Props ) {
	const translate = useTranslate();

	return (
		<A4APopover
			className="checkout__button-popover"
			title={ translate( 'Payment reminder' ) }
			offset={ 12 }
			position="top"
			wrapperRef={ wrapperRef }
			onFocusOutside={ hidePopover }
		>
			<div className="checkout__button-popover-description">
				{ translate(
					'Your payment for the latest invoice is now overdue. To continue purchasing products and maintain uninterrupted services,{{br/}}please make your payment as soon as{{nbsp/}}possible.',
					{
						components: {
							br: <br />,
							nbsp: <>&nbsp;</>,
						},
					}
				) }
			</div>
			<Button className="is-dark" href={ A4A_INVOICES_LINK }>
				{ translate( 'Pay invoice' ) }
			</Button>
		</A4APopover>
	);
}

import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import LayoutBanner from 'calypso/a8c-for-agencies/components/layout/banner';

type Props = {
	email: string;
	onClose?: () => void;
	isFullWidth?: boolean;
};

export default function NewReferralOrderNotification( { email, onClose, isFullWidth }: Props ) {
	const [ showBanner, setShowBanner ] = useState( true );

	const translate = useTranslate();

	const onCloseClick = () => {
		setShowBanner( false );
		onClose?.();
	};

	return (
		showBanner && (
			<LayoutBanner isFullWidth={ isFullWidth } level="success" onClose={ onCloseClick }>
				{ translate(
					'Your referral order was emailed to %(referralEmail)s for payment.{{br/}}Once they pay you can assign the items that were purchased.',
					{
						components: { br: <br /> },
						args: { referralEmail: email },
						comment: 'The %(referralEmail)s is the email where referral order was sent.',
					}
				) }
			</LayoutBanner>
		)
	);
}

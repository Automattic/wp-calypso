import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import LayoutBanner from 'calypso/a8c-for-agencies/components/layout/banner';

type Props = {
	email: string;
	onClose?: () => void;
};

export default function NewReferralOrderNotification( { email, onClose }: Props ) {
	const [ showBanner, setShowBanner ] = useState( true );

	const translate = useTranslate();

	const onCloseClick = () => {
		setShowBanner( false );
		onClose?.();
	};

	return (
		showBanner && (
			<LayoutBanner level="success" onClose={ onCloseClick }>
				{ translate( 'Your referral order was emailed to %(referralEmail)s for payment.', {
					args: { referralEmail: email },
					comment: 'The %(referralEmail)s is the email where referral order was sent.',
				} ) }
			</LayoutBanner>
		)
	);
}

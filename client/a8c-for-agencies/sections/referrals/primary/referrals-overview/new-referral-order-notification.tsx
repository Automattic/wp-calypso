import NoticeBanner from '@automattic/components/src/notice-banner';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';

type Props = {
	email: string;
	onClose?: () => void;
};

export default function NewRefferalOrderNotification( { email, onClose }: Props ) {
	const [ showBanner, setShowBanner ] = useState( true );

	const translate = useTranslate();

	const onCloseClick = () => {
		setShowBanner( false );
		onClose?.();
	};

	return (
		showBanner && (
			<NoticeBanner level="success" onClose={ onCloseClick }>
				{ translate( 'Your referral order was emailed to %(referralEmail)s for payment.', {
					args: { referralEmail: email },
					comment: 'The %(referralEmail)s is the email where referral order was sent.',
				} ) }
			</NoticeBanner>
		)
	);
}

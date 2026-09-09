import { useTranslate } from 'i18n-calypso';
import { useShowHelpCenter } from 'calypso/components/help-center';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';

export default function TransferStuckNotice( { onDismiss }: { onDismiss?: () => void } ) {
	const translate = useTranslate();
	const { setShowHelpCenter } = useShowHelpCenter();

	const openHelpCenter = () => {
		onDismiss?.();
		setShowHelpCenter( true );
	};

	return (
		<Notice
			status="is-warning"
			showDismiss={ false }
			text={ translate(
				'Setting up your site’s hosting is taking longer than it should. Get in touch and we’ll help.'
			) }
		>
			<NoticeAction onClick={ openHelpCenter }>{ translate( 'Get help' ) }</NoticeAction>
		</Notice>
	);
}

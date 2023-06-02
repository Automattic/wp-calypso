import { useTranslate } from 'i18n-calypso';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { getConfiguredTitanMailboxCount, hasTitanMailWithUs } from 'calypso/lib/titan';
import type { ResponseDomain } from 'calypso/lib/domains/types';

interface TitanUnusedMailboxesNoticeProps {
	domain: ResponseDomain;
	maxTitanMailboxCount: number;
	onFinishSetupClick: () => void;
}

const TitanUnusedMailboxesNotice = ( {
	domain,
	maxTitanMailboxCount,
	onFinishSetupClick,
}: TitanUnusedMailboxesNoticeProps ) => {
	const translate = useTranslate();

	if ( ! hasTitanMailWithUs( domain ) ) {
		return null;
	}

	const numberOfUnusedMailboxes = maxTitanMailboxCount - getConfiguredTitanMailboxCount( domain );

	if ( numberOfUnusedMailboxes <= 0 ) {
		return null;
	}

	const text = translate(
		'You have %(numberOfMailboxes)d unused mailbox. Do you want to set it up now instead of purchasing new ones?',
		'You have %(numberOfMailboxes)d unused mailboxes. Do you want to set one of them up now instead of purchasing new ones?',
		{
			count: numberOfUnusedMailboxes,
			args: {
				numberOfMailboxes: numberOfUnusedMailboxes,
			},
			comment: 'This refers to the number of mailboxes purchased that have not been set up yet',
		}
	);

	return (
		<Notice icon="notice" showDismiss={ false } status="is-warning" text={ text }>
			<NoticeAction onClick={ onFinishSetupClick }>{ translate( 'Set up mailbox' ) }</NoticeAction>
		</Notice>
	);
};

export default TitanUnusedMailboxesNotice;

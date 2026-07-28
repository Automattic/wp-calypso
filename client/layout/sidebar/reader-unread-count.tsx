import { Count } from '@automattic/components';
import { translate } from 'i18n-calypso';

interface ReaderUnreadCountProps {
	count?: number;
}

const ReaderUnreadCount = ( { count }: ReaderUnreadCountProps ): JSX.Element | null => {
	if ( ! count || count < 1 ) {
		return null;
	}

	const tooltipText = translate( '%(count)d unread (30 days)', '%(count)d unread (30 days)', {
		count,
		args: { count },
		comment: '%(count)d is the number of unread posts published in the last 30 days.',
		textOnly: true,
	} );

	return (
		<Count
			count={ count }
			tabIndex={ 0 }
			tooltipText={ tooltipText }
			aria-label={ tooltipText }
			compact
		/>
	);
};

export default ReaderUnreadCount;

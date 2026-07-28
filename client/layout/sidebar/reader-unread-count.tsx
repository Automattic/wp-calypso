import { Count } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

interface ReaderUnreadCountProps {
	count?: number;
}

const ReaderUnreadCount = ( { count }: ReaderUnreadCountProps ): JSX.Element | null => {
	const translate = useTranslate();

	if ( ! count || count < 1 ) {
		return null;
	}

	const tooltipText = translate( '%(count)d unread (30 days)', {
		args: { count },
		comment: '%(count)d is the number of unread posts published in the last 30 days.',
		textOnly: true,
	} );

	return <Count count={ count } tooltipText={ tooltipText } aria-label={ tooltipText } compact />;
};

export default ReaderUnreadCount;

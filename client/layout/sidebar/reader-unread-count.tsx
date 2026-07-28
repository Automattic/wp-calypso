import { Count, Tooltip } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import type { MouseEvent } from 'react';

interface ReaderUnreadCountProps {
	count?: number;
}

const ReaderUnreadCount = ( { count }: ReaderUnreadCountProps ): JSX.Element | null => {
	const translate = useTranslate();
	const [ anchor, setAnchor ] = useState< HTMLSpanElement | null >( null );

	if ( ! count || count < 1 ) {
		return null;
	}

	const tooltipText = translate( '%(count)d unread (30 days)', {
		args: { count },
		comment: '%(count)d is the number of unread posts published in the last 30 days.',
		textOnly: true,
	} );

	return (
		<>
			<Count
				count={ count }
				aria-label={ tooltipText }
				compact
				onMouseEnter={ ( event: MouseEvent< HTMLSpanElement > ) =>
					setAnchor( event.currentTarget )
				}
				onMouseLeave={ () => setAnchor( null ) }
			/>

			<Tooltip context={ anchor } focusOnShow={ false } isVisible={ !! anchor } showDelay={ 500 }>
				{ tooltipText }
			</Tooltip>
		</>
	);
};

export default ReaderUnreadCount;

/**
 * External dependencies
 */

import React, { PureComponent } from 'react';
import { noop } from 'lodash-es';

/**
 * Internal dependencies
 */
import Timeline from 'calypso/components/timeline';
import TimelineEvent from 'calypso/components/timeline/timeline-event.jsx';

class TimelineExample extends PureComponent {
	static displayName = 'TimelineExample';

	render() {
		return (
			<Timeline>
				<TimelineEvent
					date={ new Date( '14 March 2017' ) }
					detail="Domain registered and activated by Jane Doe."
					icon="checkmark"
					iconBackground="success"
					actionLabel="Delete domain"
					onActionClick={ noop }
				/>
				<TimelineEvent
					date={ new Date( '11 February 2021' ) }
					detail="You have Auto-renew enabled which means your domain will automatically be renewed for you every year."
					icon="sync"
					actionLabel="Disable Auto-renew"
					onActionClick={ noop }
				/>
				<TimelineEvent
					date={ new Date( '14 March 2021' ) }
					detail="Your domain will expire and your site will not be accessible from this URL any longer. You can renew any time or turn on auto-renew."
					icon="notice-outline"
					iconBackground="warning"
					actionLabel="Enable Auto-renew"
					actionIsPrimary
					onActionClick={ noop }
				/>
				<TimelineEvent
					date={ new Date( '28 April 2021' ) }
					detail="Renewal grace period: You can still renew your expired domain at the standard rate during this period."
					icon="time"
					disabled
				/>
				<TimelineEvent
					date={ new Date( '28 May 2021' ) }
					detail="Redemption period: You can renew your expired domain with an extra fee of $80."
					icon="time"
					disabled
				/>
				<TimelineEvent
					date={ new Date( '28 May 2021' ) }
					detail="Your domain registration will be canceled and your domain will become publicly available for registration."
					icon="cross"
					disabled
				/>
				<TimelineEvent
					date={ new Date( '28 May 2021' ) }
					detail="Just an example of a timeline event with an error icon highlight and a scary action."
					icon="cross"
					iconBackground="error"
					actionLabel="Watch out!"
					actionIsScary
					actionIsPrimary
					onActionClick={ noop }
				/>
			</Timeline>
		);
	}
}

export default TimelineExample;

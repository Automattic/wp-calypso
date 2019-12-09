/**
 * External dependencies
 */

import React, { PureComponent } from 'react';
import { noop } from 'lodash-es';

/**
 * Internal dependencies
 */
import Timeline from 'components/timeline';
import TimelineEvent from 'components/timeline/timeline-event.jsx';

class TimelineExample extends PureComponent {
	static displayName = 'TimelineExample';

	render() {
		return (
			<Timeline>
				<TimelineEvent
					date={ new Date( 'March 14, 2017' ) }
					detail="Domain registered and activated by Jane Doe"
					icon="checkmark"
					iconHighlight="success"
					actionLabel="Delete domain"
					onActionClick={ noop }
				/>
				<TimelineEvent
					date={ new Date( 'February 11, 2021' ) }
					detail="You have Auto-renew enabled which means your domain will automatically be newed for you every year."
					icon="sync"
					actionLabel="Disable Auto-renew"
					onActionClick={ noop }
				/>
				<TimelineEvent
					date={ new Date( 'March 14, 2021' ) }
					detail="Your domain will expire and your site will not be accessible from this URL any longer. You can renew any time or turn on auto-renew."
					icon="notice-outline"
					iconHighlight="warning"
					actionLabel="Enable Auto-renew"
					actionIsPrimary
					onActionClick={ noop }
				/>
				<TimelineEvent
					date={ new Date( 'April 28, 2021' ) }
					detail="Renewal grace period: You can still renew your expired domain at the standard rate during this period."
					icon="time"
					disabled
				/>
				<TimelineEvent
					date={ new Date( 'May 28, 2021' ) }
					detail="Redemption period: You can renew your expired domain with an extra fee of $80."
					icon="time"
					disabled
				/>
				<TimelineEvent
					date={ new Date( 'May 28, 2021' ) }
					detail="Your domain registration will be canceled and your domain will become publicly available for registration."
					icon="cross"
					disabled
				/>
				<TimelineEvent
					date={ new Date( 'May 28, 2021' ) }
					detail="Just an example of a timeline item with an error icon highlight and a scary action."
					icon="cross"
					iconHighlight="error"
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

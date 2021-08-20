import moment from 'moment';
import React from 'react';
import TimeSince from 'calypso/components/time-since';

const TimeSinceExample = () => {
	return (
		<div>
			<div>
				<TimeSince date={ moment().subtract( 5, 'minutes' ).toDate() } />
			</div>
			<div>
				<TimeSince date={ moment().subtract( 5, 'months' ).toDate() } />
			</div>
		</div>
	);
};

TimeSinceExample.displayName = 'TimeSinceExample';

export default TimeSinceExample;

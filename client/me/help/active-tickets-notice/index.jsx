/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Notice from 'calypso/components/notice';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

/**
 * Style dependencies
 */
import './style.scss';

class ActiveTicketsNotice extends React.Component {
	componentDidMount() {
		recordTracksEvent( 'calypso_help_active_requests_notice_shown', {
			active_ticket_count: this.props.count,
		} );
	}

	render() {
		const { translate, compact, count } = this.props;

		const text = translate(
			'You have %(requestCount)d open request. Rest assured that your ' +
				"email arrived safely and we'll be in touch as soon as we can.",
			'You have %(requestCount)d open requests. Rest assured that your ' +
				"emails arrived safely and we'll be in touch as soon as we can.",
			{
				count: count,
				args: { requestCount: count },
				comment: `An "open request" is a support email that hasn't been resolved`,
			}
		);

		return (
			<div className="active-tickets-notice">
				<Notice status="is-info" showDismiss={ false } isCompact={ compact } text={ text }></Notice>
			</div>
		);
	}
}

export default localize( ActiveTicketsNotice );

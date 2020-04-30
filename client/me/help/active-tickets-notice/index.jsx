/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import { recordTracksEvent } from 'lib/analytics/tracks';
import { abtest } from 'lib/abtest';

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
		// During AB test, only show the notice to those in the test group. We're
		// controlling the visibility here, so that we can still mount the component
		// from the parent which fires the tracks event — we want the event to
		// fire for both AB groups.
		if ( abtest( 'showActiveTicketsNotice' ) !== 'showNotice' ) {
			return null;
		}

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

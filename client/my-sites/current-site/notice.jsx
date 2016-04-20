/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';

export default React.createClass( {
	displayName: 'SiteNotice',

	propTypes: {
		site: React.PropTypes.object
	},

	getDefaultProps() {
		return {
		};
	},

	render() {
		return (
			<Notice isCompact status="is-success" icon="info-outline">
				{ this.translate( 'Unused domain credit' ) }
				<NoticeAction>
					Claim
				</NoticeAction>
			</Notice>
		);
	}
} );

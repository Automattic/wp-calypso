/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

var FollowingEditNavigation = React.createClass( {
	propTypes: { totalSubscriptions: React.PropTypes.number },

	renderSiteCount: function() {
		const totalSubscriptions = this.props.totalSubscriptions;
		if ( ! totalSubscriptions ) {
			return null;
		}

		return this.props.translate( '%(count)d site', '%(count)d sites', {
			count: totalSubscriptions,
			args: { count: totalSubscriptions },
		} );
	},

	render: function() {
		return (
			<div className="following-edit-navigation">
				<span className="following-edit-navigation__site-count">{ this.renderSiteCount() }</span>
			</div>
		);
	},
} );

export default localize( FollowingEditNavigation );

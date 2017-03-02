// External dependencies
import React from 'react';

var FollowingEditNavigation = React.createClass( {

	propTypes: { totalSubscriptions: React.PropTypes.number },

	renderSiteCount: function() {
		const totalSubscriptions = this.props.totalSubscriptions;
		if ( ! totalSubscriptions ) {
			return null;
		}

		return this.translate(
			'%(count)d site',
			'%(count)d sites',
			{
				count: totalSubscriptions,
				args: { count: totalSubscriptions }
			}
		);
	},

	render: function() {
		return (
			<div className="following-edit-navigation">
				<span className="following-edit-navigation__site-count">{ this.renderSiteCount() }</span>
			</div>
		);
	}
} );

module.exports = FollowingEditNavigation;

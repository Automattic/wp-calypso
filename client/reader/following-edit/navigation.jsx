/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

class FollowingEditNavigation extends React.Component {
    static propTypes = { totalSubscriptions: React.PropTypes.number };

    renderSiteCount = () => {
		const totalSubscriptions = this.props.totalSubscriptions;
		if ( ! totalSubscriptions ) {
			return null;
		}

		return this.props.translate( '%(count)d site', '%(count)d sites', {
			count: totalSubscriptions,
			args: { count: totalSubscriptions },
		} );
	};

    render() {
		return (
			<div className="following-edit-navigation">
				<span className="following-edit-navigation__site-count">{ this.renderSiteCount() }</span>
			</div>
		);
	}
}

export default localize( FollowingEditNavigation );

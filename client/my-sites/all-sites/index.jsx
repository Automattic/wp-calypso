/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import AllSitesIcon from 'my-sites/all-sites-icon';
import Count from 'components/count';
import userLib from 'lib/user';

const user = userLib();

export default React.createClass( {
	displayName: 'AllSites',

	getDefaultProps() {
		return {
			onSelect: function() {},
			href: null,
			isSelected: false,
			showCount: true
		};
	},

	propTypes: {
		sites: React.PropTypes.object.isRequired,
		onSelect: React.PropTypes.func,
		href: React.PropTypes.string,
		isSelected: React.PropTypes.bool,
		showCount: React.PropTypes.bool
	},

	onSelect( event ) {
		this.props.onSelect( event );
	},

	render() {
		const allSitesClass = classNames( {
			'all-sites': true,
			'is-selected': this.props.isSelected
		} );

		return (
			<div className={ allSitesClass }>
				<a className="site__content" href={ this.props.href } onTouchTap={ this.onSelect }>
					<div className="site__info">
						{ this.props.showCount && <Count count={ user.get().visible_site_count } /> }
						<span className="site__title">{ this.translate( 'All My Sites' ) }</span>
					</div>
					<AllSitesIcon sites={ this.props.sites.get() } />
				</a>
			</div>
		);
	}
} );

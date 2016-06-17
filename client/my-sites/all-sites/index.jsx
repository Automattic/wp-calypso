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
			showCount: true,
			domain: ''
		};
	},

	propTypes: {
		sites: React.PropTypes.array,
		onSelect: React.PropTypes.func,
		href: React.PropTypes.string,
		isSelected: React.PropTypes.bool,
		showCount: React.PropTypes.bool,
		count: React.PropTypes.number,
		title: React.PropTypes.string,
		domain: React.PropTypes.string
	},

	onSelect( event ) {
		this.props.onSelect( event );
	},

	renderSiteCount() {
		const count = this.props.count || user.get().visible_site_count;
		return <Count count={ count } />;
	},

	render() {
		const allSitesClass = classNames( {
			'all-sites': true,
			'is-selected': this.props.isSelected
		} );

		const title = this.props.title || this.translate( 'All My Sites' );

		return (
			<div className={ allSitesClass }>
				<a className="site__content" href={ this.props.href } onTouchTap={ this.onSelect }>
					{ this.props.showCount && this.renderSiteCount() }
					<div className="site__info">
						<span className="site__title">{ title }</span>
						{ this.props.domain && <span className="site__domain">{ this.props.domain }</span> }
						<AllSitesIcon sites={ this.props.sites } />
					</div>
				</a>
			</div>
		);
	}
} );

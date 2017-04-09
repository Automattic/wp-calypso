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
			isHighlighted: false,
			showCount: true,
			domain: ''
		};
	},

	propTypes: {
		sites: React.PropTypes.array,
		onSelect: React.PropTypes.func,
		href: React.PropTypes.string,
		isSelected: React.PropTypes.bool,
		isHighlighted: React.PropTypes.bool,
		showCount: React.PropTypes.bool,
		count: React.PropTypes.number,
		title: React.PropTypes.string,
		domain: React.PropTypes.string,
		onMouseEnter: React.PropTypes.func,
		onMouseLeave: React.PropTypes.func
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
			'is-selected': this.props.isSelected,
			'is-highlighted': this.props.isHighlighted
		} );

		const title = this.props.title || this.translate( 'All My Sites' );

		return (
			<div className={ allSitesClass }>
				<a
					className="site__content"
					href={ this.props.href }
					onMouseEnter={ this.props.onMouseEnter }
					onMouseLeave={ this.props.onMouseLeave }
					onClick={ this.onSelect }>
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

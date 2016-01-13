/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Gridicon from 'components/gridicon';

export default React.createClass( {
	displayName: 'StatsOverviewPlaceholder',

	propTypes: {
		insights: PropTypes.bool
	},

	render() {
		let icon;

		if ( ! this.props.insights ) {
			icon = <div className="module-header__site-icon"><img width="24" height="24" /></div>;
		}

		return (
			<Card className="stats-module is-loading">

				<div className="module-header">
					<h3 className="module-header-title">
						<a href="#" className="module-header__link">
							{ icon }
							<span className="module-header__right-icon">
								<Gridicon icon="stats" />
							</span>
							<span>{ this.translate( 'Loading Stats' ) }</span>
						</a>
					</h3>
				</div>

				<ul className="module-tabs">
					<li className="module-tab is-views is-loading">
						<a href="#"><Gridicon icon="visible" size={ 18 } /><span className="label">{ this.translate( 'Views' ) }</span> <span className="value">&ndash;</span></a>
					</li>
					<li className="module-tab is-visitors is-loading">
						<a href="#"><Gridicon icon="user" size={ 18 } /><span className="label">{ this.translate( 'Visitors' ) }</span> <span className="value">&ndash;</span></a>
					</li>
					<li className="module-tab is-likes is-loading">
						<a href="#"><Gridicon icon="star" size={ 18 } /><span className="label">{ this.translate( 'Likes' ) }</span> <span className="value">&ndash;</span></a>
					</li>
					<li className="module-tab is-comments is-loading">
						<a href="#"><Gridicon icon="comment" size={ 18 } /><span className="label">{ this.translate( 'Comments' ) }</span> <span className="value">&ndash;</span></a>
					</li>
				</ul>
			</Card>
		);
	}
} );

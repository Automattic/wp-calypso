/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import StatsTabs from '../stats-tabs';
import StatsTab from '../stats-tabs/tab';

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

				<StatsTabs>
					<StatsTab
						isLoading={ true }
						gridicon="visible"
						label={ this.translate( 'Views', { context: 'noun' } ) }
						value={ null } />
					<StatsTab
						isLoading={ true }
						gridicon="user"
						label={ this.translate( 'Visitors', { context: 'noun' } ) }
						value={ null } />
					<StatsTab
						isLoading={ true }
						gridicon="star"
						label={ this.translate( 'Likes', { context: 'noun' } ) }
						value={ null } />
					<StatsTab
						isLoading={ true }
						gridicon="comment"
						label={ this.translate( 'Comments', { context: 'noun' } ) }
						value={ null } />
				</StatsTabs>
			</Card>
		);
	}
} );

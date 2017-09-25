/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import StatsTabs from '../stats-tabs';
import StatsTab from '../stats-tabs/tab';
import Card from 'components/card';

export default localize( React.createClass( {
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
							<span>{ this.props.translate( 'Loading Stats' ) }</span>
						</a>
					</h3>
				</div>

				<StatsTabs>
					<StatsTab
						isLoading={ true }
						gridicon="visible"
						label={ this.props.translate( 'Views', { context: 'noun' } ) }
						value={ null } />
					<StatsTab
						isLoading={ true }
						gridicon="user"
						label={ this.props.translate( 'Visitors', { context: 'noun' } ) }
						value={ null } />
					<StatsTab
						isLoading={ true }
						gridicon="star"
						label={ this.props.translate( 'Likes', { context: 'noun' } ) }
						value={ null } />
					<StatsTab
						isLoading={ true }
						gridicon="comment"
						label={ this.props.translate( 'Comments', { context: 'noun' } ) }
						value={ null } />
				</StatsTabs>
			</Card>
		);
	}
} ) );

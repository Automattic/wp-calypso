/**
* External dependencies
*/
import React, { PropTypes } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import observe from 'lib/mixins/data-observe';
import Card from 'components/card';
import User from 'lib/user';
import toggle from '../mixin-toggle';
import Gridicon from 'components/gridicon';
import StatsTabs from '../stats-tabs';
import StatsTab from '../stats-tabs/tab';

const user = User();

export default React.createClass( {
	displayName: 'StatsAllTime',

	mixins: [ toggle( 'allTimeList' ), observe( 'allTimeList' ) ],

	propTypes: {
		allTimeList: PropTypes.object.isRequired
	},

	render() {
		const infoIcon = this.state.showInfo ? 'info' : 'info-outline';
		const allTimeList = this.props.allTimeList.response;
		const { showInfo, showModule } = this.state;
		const isLoading = this.props.allTimeList.isLoading();

		let bestDay;

		if ( allTimeList['best-views'] && allTimeList['best-views'].day ) {
			bestDay = this.moment( allTimeList['best-views'].day ).format( 'LL' );
		}

		const classes = {
			'is-expanded': showModule,
			'is-showing-info': showInfo,
			'is-loading': this.props.allTimeList.isLoading(),
			'is-non-en': user.data.localeSlug && ( user.data.localeSlug !== 'en' )
		};

		const bestViews = allTimeList['best-views'] ? allTimeList['best-views'].count : null;

		return (
			<Card className={ classNames( 'stats-module', 'stats-all-time', classes ) }>
				<div className="module-header">
				<h1 className="module-header-title">{ this.translate( 'All-time posts, views, and visitors' ) }</h1>
					<ul className="module-header-actions">
						<li className="module-header-action toggle-info">
							<a
								href="#"
								className="module-header-action-link"
								aria-label={
									this.translate(
										'Show or hide panel information',
										{ context: 'Stats panel action' }
									)
								}
								title={
									this.translate(
										'Show or hide panel information',
										{ context: 'Stats panel action' }
									)
								}
								onClick={
									this.toggleInfo
								}
							>
								<Gridicon icon={ infoIcon } />
							</a>
						</li>
					</ul>
				</div>
				<div className="module-content">
					<div className="module-content-text module-content-text-info">
						<p>{ this.translate( 'These are your site\'s overall total number of Posts, Views and Visitors as well as the day when you had the most number of Views.' ) }</p>
					</div>

					<StatsTabs>
						<StatsTab
							gridicon="posts"
							label={ this.translate( 'Posts' ) }
							loading={ isLoading }
							value={ allTimeList.posts } />
						<StatsTab
							gridicon="visible"
							label={ this.translate( 'Views' ) }
							loading={ isLoading }
							value={ allTimeList.views } />
						<StatsTab
							gridicon="user"
							label={ this.translate( 'Visitors' ) }
							loading={ isLoading }
							value={ allTimeList.visitors } />
						<StatsTab
							className="stats-all-time__is-best"
							gridicon="trophy"
							label={ this.translate( 'Best Views Ever' ) }
							loading={ isLoading }
							value={ bestViews }>
							<span className="stats-all-time__best-day">{ bestDay }</span>
						</StatsTab>
					</StatsTabs>
				</div>
			</Card>
		);
	}
} );

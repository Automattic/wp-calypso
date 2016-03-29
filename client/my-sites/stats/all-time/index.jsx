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
import StatsTabs from '../stats-tabs';
import StatsTab from '../stats-tabs/tab';
import SectionHeader from 'components/section-header';

const user = User();

export default React.createClass( {
	displayName: 'StatsAllTime',

	mixins: [ observe( 'allTimeList' ) ],

	propTypes: {
		allTimeList: PropTypes.object.isRequired
	},

	render() {
		const allTimeList = this.props.allTimeList.response;
		const isLoading = this.props.allTimeList.isLoading();

		let bestDay;

		if ( allTimeList['best-views'] && allTimeList['best-views'].day ) {
			bestDay = this.moment( allTimeList['best-views'].day ).format( 'LL' );
		}

		const classes = {
			'is-loading': this.props.allTimeList.isLoading(),
			'is-non-en': user.data.localeSlug && ( user.data.localeSlug !== 'en' )
		};

		const bestViews = allTimeList['best-views'] ? allTimeList['best-views'].count : null;

		return (
			<div>
				<SectionHeader label={ this.translate( 'All-time posts, views, and visitors' ) }></SectionHeader>
				<Card className={ classNames( 'stats-module', 'stats-all-time', classes ) }>
					<div className="module-content">
						<StatsTabs borderless>
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
								className="is-best"
								gridicon="trophy"
								label={ this.translate( 'Best Views Ever' ) }
								loading={ isLoading }
								value={ bestViews }>
								<span className="stats-all-time__best-day">{ bestDay }</span>
							</StatsTab>
						</StatsTabs>
					</div>
				</Card>
			</div>
		);
	}
} );

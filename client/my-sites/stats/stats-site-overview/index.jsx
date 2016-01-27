/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import observe from 'lib/mixins/data-observe';
import route from 'lib/route';
import Card from 'components/card';
import Gridicon from 'components/gridicon';
import StatsTabs from '../stats-tabs';
import StatsTab from '../stats-tabs/tab';
import Button from 'components/button';
import SectionHeader from 'components/section-header';

export default React.createClass( {
	displayName: 'StatsSiteOverview',

	proptypes: {
		site: PropTypes.object.isRequired,
		summaryData: PropTypes.object.isRequired,
		path: PropTypes.string.isRequired
	},

	mixins: [ observe( 'summaryData' ) ],

	isValueLow( value ) {
		return ! value || 0 === value;
	},

	render() {
		const { site, path, summaryData, insights } = this.props;
		const { views, visitors, likes, comments } = summaryData.data;
		const siteStatsPath = [ path, site.slug ].join( '/' );
		let headerPath = siteStatsPath;
		let title;

		if ( insights ) {
			title = this.translate( 'Today\'s Stats' );
		} else {
			title = site.title;
			headerPath = route.getStatsDefaultSitePage( site.slug );
		}

		if ( ! this.props.summaryData ) {
			return;
		}

		return (
			<div>
				<SectionHeader label={ title }>
					<Button borderless compact href={ headerPath }><Gridicon icon="chevron-right" /></Button>
				</SectionHeader>
				<Card key={ site.ID } className="stats__overview stats-module is-site-overview">
					<StatsTabs borderless>
						<StatsTab
							className={ this.isValueLow( views ) ? 'is-low' : null }
							href={ siteStatsPath }
							gridicon="visible"
							label={ this.translate( 'Views', { context: 'noun' } ) }
							value={ views } />
						<StatsTab
							className={ this.isValueLow( visitors ) ? 'is-low' : null }
							href={ siteStatsPath + '?tab=visitors' }
							gridicon="user"
							label={ this.translate( 'Visitors', { context: 'noun' } ) }
							value={ visitors } />
						<StatsTab
							className={ this.isValueLow( likes ) ? 'is-low' : null }
							href={ siteStatsPath + '?tab=likes' }
							gridicon="star"
							label={ this.translate( 'Likes', { context: 'noun' } ) }
							value={ likes } />
						<StatsTab
							className={ this.isValueLow( comments ) ? 'is-low' : null }
							href={ siteStatsPath + '?tab=comments' }
							gridicon="comment"
							label={ this.translate( 'Comments', { context: 'noun' } ) }
							value={ comments } />
					</StatsTabs>
				</Card>
			</div>
		);
	}
} );

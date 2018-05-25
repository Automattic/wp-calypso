import React, { Component } from 'react';
import { connect } from 'react-redux';
import { moment } from 'i18n-calypso';
import getPrimarySiteId from 'state/selectors/get-primary-site-id';
import { isRequestingTopPosts, getTopPosts } from 'state/stats/top-posts/selectors';
import QueryTopPosts from 'components/data/query-top-posts';
import SegmentedControl from 'components/segmented-control';
import SegmentedControlItem from 'components/segmented-control/item';
import DatePicker from 'components/date-picker';
import Card from 'components/card';
import SitesDropdown from 'components/sites-dropdown';
import Range from 'components/forms/range';

class TopPostsList extends Component {
	render() {
		const { requesting, topPosts, siteId, date, period, max } = this.props;
		const posts = topPosts && Object.values( topPosts )[ 0 ];
		const postsReady = ! requesting && posts && posts.postviews;
		return (
			<div>
				{ siteId &&
					<QueryTopPosts
						siteId={ siteId }
						query={ { date: date.format( 'YYYY-MM-DD' ), period, max } }
					/> }
				<div>
					<h3>Results</h3>
					<div>
						<Card>
							{ requesting && <p>Loading…</p> }
							{ postsReady &&
								( posts.postviews.length === 0
									? <p>No post views for the selected parameters.</p>
									: <div>
											<p>
												Top views for the { period } including the { date.format( 'DD/MM/YYYY' ) }:
											</p>
											<ul>
												{ posts.postviews.map( post =>
													<li key={ post.id }>
														<a href={ post.href }>
															{ post.title }
														</a>
														<span>
															{' '}
															({ post.views } views)
														</span>
													</li>,
												) }
											</ul>
										</div> ) }
						</Card>
					</div>
				</div>
			</div>
		);
	}
}
TopPostsList = connect( ( state, props ) => {
	const { siteId, date, period, max } = props;
	const query = { date: date.format( 'YYYY-MM-DD' ), period, max }
	const topPosts = getTopPosts( state, siteId, query );
	const requesting = isRequestingTopPosts( state, siteId, query );

	return {
		requesting,
		topPosts,
	};
} )( TopPostsList );

class TopPostsSyntax extends Component {
	render() {
		const { siteId, date, period, max } = this.props;
		const querySyntax = `<QueryTopPosts
  siteId={ siteId /* ${ siteId } */ }
  query={ {
    date, // '${ date.format( 'YYYY-MM-DD' ) }'
    period, // '${ period }'
    max, // ${ max }
  } }
/>`;
		const getTopPostsSyntax = `getTopPosts(
  state,
  siteId, // ${ siteId }
  query: {
    date, // '${ date.format( 'YYYY-MM-DD' ) }'
    period, // '${ period }'
    max, // ${ max }
  },
)`;
		const isRequestingTopPostsSyntax = `isRequestingTopPosts(
  state,
  siteId, // ${ siteId }
  query: {
    date, // '${ date.format( 'YYYY-MM-DD' ) }'
    period, // '${ period }'
    max, // ${ max }
  },
)`;
		return (
			<div>
				<h3>Syntax</h3>
				<Card>
					<h4>Query Component</h4>
					<pre>
						<code>
							{ querySyntax }
						</code>
					</pre>
					<h4>Related Selectors</h4>
					<p>
						<code>getTopPosts()</code>
					</p>
					<pre>
						<code>
							{ getTopPostsSyntax }
						</code>
					</pre>
					<p>
						<code>isRequestingTopPosts()</code>
					</p>
					<pre>
						<code>
							{ isRequestingTopPostsSyntax }
						</code>
					</pre>
				</Card>
			</div>
		);
	}
}

class TopPostsConfigurator extends Component {
	constructor( props ) {
		super( props );
		this.state = { calendarOpened: false };
	}
	closeCalendar = () => {
		this.setState( { calendarOpened: false } );
	};
	openCalendar = event => {
		this.setState( { calendarOpened: ! this.state.calendarOpened } );
	};
	handleMaxChange = event => {
		this.props.onMaxUpdate( parseInt( event.target.value, 10 ) );
	};
	render() {
		const { date, period, siteId, max, onDateUpdate, onPeriodUpdate, onSiteIdUpdate } = this.props;
		const { calendarOpened } = this.state;
		return (
			<div className="docs-data__config-section">
				<div className="docs-data__config-block">
					<h3>Site</h3>
					<SitesDropdown selectedSiteId={ siteId } onSiteSelect={ onSiteIdUpdate } />
				</div>
				<div className="docs-data__config-block">
					<h3>Period</h3>
					<p>
						<SegmentedControl>
							<SegmentedControlItem
								selected={ period === 'day' }
								onClick={ () => onPeriodUpdate( 'day' ) }
							>
								day
							</SegmentedControlItem>
							<SegmentedControlItem
								selected={ period === 'week' }
								onClick={ () => onPeriodUpdate( 'week' ) }
							>
								week
							</SegmentedControlItem>
							<SegmentedControlItem
								selected={ period === 'month' }
								onClick={ () => onPeriodUpdate( 'month' ) }
							>
								month
							</SegmentedControlItem>
							<SegmentedControlItem
								selected={ period === 'year' }
								onClick={ () => onPeriodUpdate( 'year' ) }
							>
								year
							</SegmentedControlItem>
						</SegmentedControl>
					</p>
				</div>
				<div className="docs-data__config-block">
					<h3>Most recent day to include</h3>
					<Card>
						<DatePicker onSelectDay={ onDateUpdate } initialMonth={ date } selectedDay={ date } />
					</Card>
				</div>
				<div className="docs-data__config-block">
					<h3>Maximum number of posts</h3>
					<p>
						Value: { max }
					</p>
					<Range
						min={ 1 }
						max={ 40 }
						value={ max }
						onChange={ this.handleMaxChange }
						showValueLabel={ false }
					/>
				</div>
			</div>
		);
	}
}

class QueryTopPostsExample extends Component {
	constructor( props ) {
		super( props );
		const { primarySiteId } = props;
		this.state = {
			siteId: primarySiteId || null,
			date: moment().subtract( 1, 'days' ),
			period: 'day',
			max: 10,
		};
	}
	updateDate = date => {
		this.setState( { date: date.startOf( 'day' ) } );
	};
	updatePeriod = period => {
		this.setState( { period } );
	};
	updateSiteId = siteId => {
		this.setState( { siteId } );
	};
	updateMax = max => {
		this.setState( { max } );
	};
	render() {
		const { period, date, siteId, max } = this.state;
		return (
			<div className="docs-data__group">
				<div>
					<TopPostsConfigurator
						date={ date }
						onDateUpdate={ this.updateDate }
						period={ period }
						onPeriodUpdate={ this.updatePeriod }
						siteId={ siteId }
						onSiteIdUpdate={ this.updateSiteId }
						max={ max }
						onMaxUpdate={ this.updateMax }
					/>
				</div>
				<div>
					<TopPostsList date={ date } period={ period } siteId={ siteId } max={ max } />
					<TopPostsSyntax date={ date } period={ period } siteId={ siteId } max={ max } />
				</div>
			</div>
		);
	}
}

QueryTopPostsExample = connect( state => {
	const primarySiteId = getPrimarySiteId( state );
	return { primarySiteId };
} )( QueryTopPostsExample );

QueryTopPostsExample.displayName = 'QueryTopPosts';

export default QueryTopPostsExample;

/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { throttle } from 'lodash';
import i18n, { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Month from './month';
import Card from 'client/components/card';
import SectionHeader from 'client/components/section-header';
import QuerySiteStats from 'client/components/data/query-site-stats';
import { getSiteOption } from 'client/state/sites/selectors';
import { getSelectedSiteId } from 'client/state/ui/selectors';
import {
	getSiteStatsPostStreakData,
	getSiteStatsMaxPostsByDay,
	getSiteStatsTotalPostsForStreakQuery,
} from 'client/state/stats/lists/selectors';

class PostTrends extends React.Component {
	static displayName = 'PostTrends';

	static propTypes = {
		siteId: PropTypes.number,
		query: PropTypes.object,
	};

	state = {
		canScrollLeft: false,
		canScrollRight: false,
	};

	componentDidMount() {
		var node = this.refs.wrapper,
			yearNode = this.refs.year,
			computedStyle = window.getComputedStyle( yearNode ),
			margin =
				parseInt( computedStyle.getPropertyValue( 'margin-left' ), 10 ) +
				parseInt( computedStyle.getPropertyValue( 'margin-right' ), 10 );

		// Initially scroll all the way to the left
		yearNode.style.left = 0 - yearNode.scrollWidth + node.clientWidth - margin + 'px';

		// Add resize listener
		this.resize = throttle( this.resize, 400 );
		window.addEventListener( 'resize', this.resize );
		this.resize();
	}

	// Remove listener
	componentWillUnmount() {
		window.removeEventListener( 'resize', this.resize );
	}

	shouldComponentUpdate( nextProps ) {
		// only update if the total number of posts, or query.endDate has changed
		return (
			nextProps.totalPosts !== this.props.totalPosts ||
			nextProps.query.endDate !== this.props.query.endDate
		);
	}

	resize = () => {
		var scrollProps = {},
			node = this.refs.wrapper,
			yearNode = this.refs.year,
			computedStyle = window.getComputedStyle( yearNode ),
			margin =
				parseInt( computedStyle.getPropertyValue( 'margin-left' ), 10 ) +
				parseInt( computedStyle.getPropertyValue( 'margin-right' ), 10 ),
			left = parseInt( yearNode.style.left, 10 );

		scrollProps.canScrollLeft = left < 0;
		scrollProps.canScrollRight = left > 0 - yearNode.scrollWidth + node.clientWidth - margin;

		if ( this.state.canScrollLeft && node.clientWidth >= yearNode.scrollWidth - margin ) {
			yearNode.style.left = '0px';
		}

		this.setState( scrollProps );
	};

	scroll = direction => {
		var node = this.refs.wrapper,
			yearNode = this.refs.year,
			computedStyle = window.getComputedStyle( yearNode ),
			margin =
				parseInt( computedStyle.getPropertyValue( 'margin-left' ), 10 ) +
				parseInt( computedStyle.getPropertyValue( 'margin-right' ), 10 ),
			left = parseInt( computedStyle.getPropertyValue( 'left' ), 10 );

		if ( 1 !== direction ) {
			direction = -1;
		}

		// scroll left 80% of the clientWidth
		left -= Math.ceil( direction * node.clientWidth * 0.8 );

		// enforce bounds
		if ( left > 0 ) {
			left = 0;
		} else if ( left < 0 - yearNode.scrollWidth + node.clientWidth - margin ) {
			left = 0 - yearNode.scrollWidth + node.clientWidth - margin;
		}

		yearNode.style.left = left + 'px';

		this.resize();
	};

	scrollLeft = () => {
		this.scroll( -1 );
	};

	scrollRight = () => {
		this.scroll( 1 );
	};

	getMonthComponents = () => {
		var i,
			months = [],
			startDate;

		for ( i = 11; i >= 0; i-- ) {
			startDate = i18n
				.moment()
				.subtract( i, 'months' )
				.startOf( 'month' );
			months.push(
				<Month
					key={ startDate.format( 'YYYYMM' ) }
					startDate={ startDate }
					streakData={ this.props.streakData }
					max={ this.props.max }
				/>
			);
		}

		return months;
	};

	render() {
		const { siteId, query } = this.props;

		const leftClass = classNames( 'post-trends__scroll-left', {
			'is-active': this.state.canScrollLeft,
		} );

		const rightClass = classNames( 'post-trends__scroll-right', {
			'is-active': this.state.canScrollRight,
		} );

		return (
			<div className="post-trends">
				{ siteId && <QuerySiteStats siteId={ siteId } statType="statsStreak" query={ query } /> }
				<SectionHeader label={ this.props.translate( 'Posting Activity' ) } />
				<Card>
					<div className={ leftClass } onClick={ this.scrollLeft }>
						<span className="left-arrow" />
					</div>
					<div className={ rightClass } onClick={ this.scrollRight }>
						<span className="right-arrow" />
					</div>
					<div ref="wrapper" className="post-trends__wrapper">
						<div ref="year" className="post-trends__year">
							{ this.getMonthComponents() }
						</div>
						<div className="post-trends__key-container">
							<span className="post-trends__key-label">
								{ this.props.translate( 'Fewer Posts', {
									context: 'Legend label in stats post trends visualization',
								} ) }
							</span>
							<ul className="post-trends__key">
								<li className="post-trends__key-day is-today" />
								<li className="post-trends__key-day is-level-1" />
								<li className="post-trends__key-day is-level-2" />
								<li className="post-trends__key-day is-level-3" />
								<li className="post-trends__key-day is-level-4" />
							</ul>
							<span className="post-trends__key-label">
								{ this.props.translate( 'More Posts', {
									context: 'Legend label in stats post trends visualization',
								} ) }
							</span>
						</div>
					</div>
				</Card>
			</div>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	const query = {
		startDate: i18n
			.moment()
			.locale( 'en' )
			.subtract( 1, 'year' )
			.startOf( 'month' )
			.format( 'YYYY-MM-DD' ),
		endDate: i18n
			.moment()
			.locale( 'en' )
			.endOf( 'month' )
			.format( 'YYYY-MM-DD' ),
		gmtOffset: getSiteOption( state, siteId, 'gmt_offset' ),
		max: 3000,
	};

	return {
		streakData: getSiteStatsPostStreakData( state, siteId, query ),
		max: getSiteStatsMaxPostsByDay( state, siteId, query ),
		totalPosts: getSiteStatsTotalPostsForStreakQuery( state, siteId, query ),
		query,
		siteId,
	};
} )( localize( PostTrends ) );

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { max, throttle, values } from 'lodash';
import { localize } from 'i18n-calypso';
import moment from 'moment';

/**
 * Internal dependencies
 */
import compareProps from 'lib/compare-props';
import Month from './month';
import { Card } from '@automattic/components';
import SectionHeader from 'components/section-header';
import QuerySiteStats from 'components/data/query-site-stats';
import { withLocalizedMoment } from 'components/localized-moment';
import { getSiteOption } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteStatsPostStreakData } from 'state/stats/lists/selectors';

/**
 * Style dependencies
 */
import './style.scss';

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

	wrapperRef = React.createRef();
	yearRef = React.createRef();

	componentDidMount() {
		const node = this.wrapperRef.current,
			yearNode = this.yearRef.current,
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

	resize = () => {
		const scrollProps = {},
			node = this.wrapperRef.current,
			yearNode = this.yearRef.current,
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

	scroll = ( direction ) => {
		const node = this.wrapperRef.current,
			yearNode = this.yearRef.current,
			computedStyle = window.getComputedStyle( yearNode ),
			margin =
				parseInt( computedStyle.getPropertyValue( 'margin-left' ), 10 ) +
				parseInt( computedStyle.getPropertyValue( 'margin-right' ), 10 );
		let left = parseInt( computedStyle.getPropertyValue( 'left' ), 10 );

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
		const { streakData } = this.props;
		// Compute maximum per-day post count from the streakData. It's used to scale the chart.
		const maxPosts = max( values( streakData ) );
		const months = [];

		for ( let i = 11; i >= 0; i-- ) {
			const startDate = this.props.moment().subtract( i, 'months' ).startOf( 'month' );
			months.push(
				<Month key={ i } startDate={ startDate } streakData={ streakData } max={ maxPosts } />
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

		/* eslint-disable jsx-a11y/click-events-have-key-events, wpcalypso/jsx-classname-namespace */
		return (
			<div className="post-trends">
				{ siteId && <QuerySiteStats siteId={ siteId } statType="statsStreak" query={ query } /> }
				<SectionHeader label={ this.props.translate( 'Posting Activity' ) } />
				<Card>
					<div className={ leftClass } onClick={ this.scrollLeft } role="button" tabIndex="0">
						<span className="left-arrow" />
					</div>
					<div className={ rightClass } onClick={ this.scrollRight } role="button" tabIndex="0">
						<span className="right-arrow" />
					</div>
					<div ref={ this.wrapperRef } className="post-trends__wrapper">
						<div ref={ this.yearRef } className="post-trends__year">
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

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const query = {
		startDate: moment()
			.locale( 'en' )
			.subtract( 1, 'year' )
			.startOf( 'month' )
			.format( 'YYYY-MM-DD' ),
		endDate: moment().locale( 'en' ).endOf( 'month' ).format( 'YYYY-MM-DD' ),
		gmtOffset: getSiteOption( state, siteId, 'gmt_offset' ),
		max: 3000,
	};

	return {
		streakData: getSiteStatsPostStreakData( state, siteId, query ),
		query,
		siteId,
	};
};

export default connect( mapStateToProps, null, null, {
	areStatePropsEqual: compareProps( { deep: [ 'query' ] } ),
} )( localize( withLocalizedMoment( PostTrends ) ) );

/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import observe from 'lib/mixins/data-observe';
import toggle from '../mixin-toggle';
import Card from 'components/card';
import Gridicon from 'components/gridicon';
import StatsModulePlaceholder from '../stats-module/placeholder';
import StatsModuleContent from '../stats-module/content-text';

export default React.createClass( {
	displayName: 'StatsPostDetailWeeks',

	mixins: [
		toggle( 'PostWeek' ),
		observe( 'site', 'postViewsList' )
	],

	propTypes: {
		postViewsList: PropTypes.object
	},

	getInitialState() {
		return {
			noData: this.props.postViewsList.isEmpty()
		};
	},

	componentWillReceiveProps( nextProps ) {
		this.setState( {
			noData: nextProps.postViewsList.isEmpty()
		} );
	},

	render() {
		const data = this.props.postViewsList.response;
		const post = data.post;
		const { showInfo, noData } = this.state;
		const infoIcon = this.state.showInfo ? 'info' : 'info-outline';
		const isLoading = this.props.postViewsList.isLoading();
		let tableHeader,
			tableRows,
			tableBody,
			highest;

		const classes = {
			'is-loading': isLoading,
			'is-showing-info': showInfo,
			'has-no-data': noData
		};

		if ( data && data.weeks ) {
			const publishDate = post.post_date ? this.moment( post.post_date ) : null;
			highest = data.highest_week_average;
			tableHeader = (
				<thead>
					<tr className="top">
						<th>{ this.translate( 'Mon' ) }</th>
						<th>{ this.translate( 'Tue' ) }</th>
						<th>{ this.translate( 'Wed' ) }</th>
						<th>{ this.translate( 'Thu' ) }</th>
						<th>{ this.translate( 'Fri' ) }</th>
						<th>{ this.translate( 'Sat' ) }</th>
						<th>{ this.translate( 'Sun' ) }</th>
						<th>{ this.translate( 'Total' ) }</th>
						<th>{ this.translate( 'Average' ) }</th>
					</tr>
				</thead>
			);

			tableRows = data.weeks.map( function( week, index ) {
				let cells = [];
				let iconType;
				let lastDay = week.days[ week.days.length - 1 ];
				let lastDayOfWeek = lastDay.day ? this.moment( lastDay.day, 'YYYY-MM-DD' ) : null;

				// If the end of this week is before post_date, return
				if ( 7 === week.days.length && publishDate && lastDayOfWeek && lastDayOfWeek.isBefore( publishDate ) ) {
					return null;
				}

				// If there are fewer than 7 days in the first week, prepend blank days
				if ( week.days.length < 7 && 0 === index ) {
					for ( let j = 0; j < 7 - week.days.length; j++ ) {
						cells.push( <td key={ 'w0e' + j }></td> );
					}
				}

				const dayCells = week.days.map( function( event, dayIndex ) {
					let day = this.moment( event.day, 'YYYY-MM-DD' ),
						cellClass = classNames( {
							'highest-count': 0 !== highest && event.count === highest
						} );

					return (
						<td key={ dayIndex } className={ cellClass }>
							<span className="stats-detail-weeks__date">{ day.format( 'MMM D' ) }</span>
							<span className="stats-detail-weeks__value">{ this.numberFormat( event.count ) }</span>
						</td>
					);
				}, this );

				cells = cells.concat( dayCells );

				// If there are fewer than 7 days in the last week, append blank days
				if ( week.days.length < 7 && 0 !== index ) {
					for ( let j = 0; j < 7 - week.days.length; j++ ) {
						cells.push( <td key={ 'w' + index + 'e' + j }></td> );
					}
				}

				cells.push( <td key={ 'total' + index }>{ this.numberFormat( week.total ) }</td> );

				if ( 'number' === typeof ( week.change ) ) {
					let changeClass = classNames( {
						'is-rising': week.change > 0,
						'is-falling': week.change < 0,
						'is-same': week.change === 0
					} );

					let displayValue = this.numberFormat( week.change, 2 ) + '%';

					if ( week.change > 0 ) {
						iconType = 'arrow-up';
					}

					if ( week.change < 0 ) {
						iconType = 'arrow-down';
					}

					if ( week.change === 0 ) {
						displayValue = this.translate( 'No change', { context: 'Stats: No change in stats value from prior period' } );
					}

					cells.push( <td key={ 'average' + index }>
						{ this.numberFormat( week.average ) }
							<span className={ 'stats-detail-weeks__value ' + changeClass } key={ 'change' + index }>
								{ iconType ? <Gridicon icon={ iconType } size={ 18 } /> : null }
								{ displayValue }
							</span></td>
						);
				} else {
					cells.push( <td className="no-data" key={ 'change' + index }></td> );
				}

				return ( <tr key={ index }>{ cells }</tr> );
			}, this );

			tableBody = ( <tbody>{ tableRows }</tbody> );
		}

		return (
			<Card className={ classNames( 'stats-module', 'is-expanded', 'is-post-weeks', classes ) }>
				<div className="module-header">
					<h4 className="module-header-title">{ this.translate( 'Recent Weeks' ) }</h4>
					<ul className="module-header-actions">
						<li className="module-header-action toggle-info">
							<a href="#"
								className="module-header-action-link"
								aria-label={ this.translate( 'Show or hide panel information', { textOnly: true, context: 'Stats panel action' } ) }
								title={ this.translate( 'Show or hide panel information', { textOnly: true, context: 'Stats panel action' } ) }
								onClick={ this.toggleInfo } >

								<Gridicon icon={ infoIcon } />
							</a>
						</li>
					</ul>
				</div>
				<StatsModuleContent className="module-content-text-info">
					<p>{ this.translate( 'This table gives you an overview of how many views your post or page has received in the recent weeks.' ) }</p>
					<span className="legend achievement">{
						this.translate(
							'%(value)s = The highest recent value',
							{ args: { value: ( this.numberFormat( highest ) ) },
							context: 'Legend for post stats page in Stats' }
						)
					}</span>
				</StatsModuleContent>
				<StatsModulePlaceholder isLoading={ isLoading } />
				<div className="module-content-table">
					<div className="module-content-table-scroll">
						<table cellPadding="0" cellSpacing="0">
							{ tableHeader }
							{ tableBody }
						</table>
					</div>
				</div>
			</Card>
		);
	}
} );

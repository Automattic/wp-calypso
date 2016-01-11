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
		const { showInfo, noData } = this.state;
		const infoIcon = this.state.showInfo ? 'info' : 'info-outline';
		let tableHeader,
			tableRows,
			tableBody,
			highest;

		const classes = {
			'is-loading': this.props.postViewsList.isLoading(),
			'is-showing-info': showInfo,
			'has-no-data': noData
		};

		if ( data && data.weeks ) {
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
						<th>{ this.translate( 'Change', { context: 'Stats: noun - change over a period in weekly numbers' } ) }</th>
					</tr>
				</thead>
				);

			tableRows = data.weeks.map( function( week, index ) {
				let cells = [],
					iconType;

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
							<span className="date">{ day.format( 'MMM D' ) }</span>
							<span className="value">{ this.numberFormat( event.count ) }</span>
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
				cells.push( <td key={ 'average' + index }>{ this.numberFormat( week.average ) }</td> );

				if ( 'number' === typeof ( week.change ) ) {
					let changeClass = classNames( {
						'value-rising': week.change > 0,
						'value-falling': week.change < 0
					} );

					if ( week.change > 0 ) {
						iconType = 'arrow-up';
					}

					if ( week.change < 0 ) {
						iconType = 'arrow-down';
					}

					cells.push(
						<td className={ changeClass } key={ 'change' + index }>
							<span className="value">
								{ iconType ? <Gridicon icon={ iconType } size={ 18 } /> : null }
								{ this.numberFormat( week.change, 2 ) }%
							</span>
						</td>
					);
				} else if ( 'object' === typeof ( week.change ) && null !== week.change && week.change.isInfinity ) {
					cells.push( <td key={ 'change' + index }>&infin;</td> );
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
				<div className="module-content">
					<div className="module-content-text module-content-text-info">
						<p className="message">{ this.translate( 'No views yet' ) }</p>
						<p>{ this.translate( 'This panel gives you an overview of how many views your website is getting recently.' ) }</p>
						<p className="legend achievement">{
							this.translate(
								'%(value)s = The highest recent value.',
								{ args: { value: ( this.numberFormat( highest ) ) },
								context: 'Legend for post stats page in Stats' }
							)
						}</p>
					</div>
					<div className="module-placeholder is-void"></div>
					<div className="module-content-table">
						<div className="module-content-table-scroll">
							<table cellPadding="0" cellSpacing="0">
								{ tableHeader }
								{ tableBody }
							</table>
						</div>
					</div>
				</div>
			</Card>
		);
	}
} );

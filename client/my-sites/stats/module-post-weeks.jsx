/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' ),
	debug = require( 'debug' )( 'calypso:stats:post' );

/**
 * Internal dependencies
 */
var observe = require( 'lib/mixins/data-observe' ),
	toggle = require( './mixin-toggle' ),
	Card = require( 'components/card' ),
	Gridicon = require( 'components/gridicon' );

module.exports = React.createClass( {
	displayName: 'StatsPostWeeks',

	mixins: [ toggle( 'PostWeek' ), observe( 'site', 'postViewsList' ) ],

	getInitialState: function() {
		return {
			noData: this.props.postViewsList.isEmpty()
		};
	},

	componentWillReceiveProps: function( nextProps ) {
		this.setState( {
			noData: nextProps.postViewsList.isEmpty()
		} );
	},

	render: function() {
		var data = this.props.postViewsList.response,
			infoIcon = this.state.showInfo ? 'info' : 'info-outline',
			tableHeader,
			tableRows,
			tableBody,
			highest,
			classes;

		debug( 'Rendering module post weeks' );

		classes = [
			'stats-module',
			'is-expanded',
			'is-post-weeks',
			{
				'is-loading': this.props.postViewsList.isLoading(),
				'is-showing-info': this.state.showInfo,
				'has-no-data': this.state.noData
			}
		];

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

			tableRows = data.weeks.map( function( e, i ) {
				var j,
					dayCells,
					cells = [],
					changeClass,
					iconType;

				// If there are fewer than 7 days in the first week, prepend blank days
				if ( e.days.length < 7 && 0 === i ) {
					for ( j = 0; j < 7 - e.days.length; j++ ) {
						cells.push( <td key={ 'w0e' + j }></td> );
					}
				}

				dayCells = e.days.map( function( e ) {
					var day = this.moment( e.day, 'YYYY-MM-DD' ),
						cellClass = classNames( {
							'highest-count': 0 !== highest && e.count === highest
						} );

					return (
						<td key={ e.day } className={ cellClass }>
								<span className="date">{ day.format( 'MMM D' ) }</span>
								<span className="value">{ this.numberFormat( e.count ) }</span>
							</td>
					);
				}, this );

				cells = cells.concat( dayCells );

				// If there are fewer than 7 days in the last week, append blank days
				if ( e.days.length < 7 && 0 !== i ) {
					for ( j = 0; j < 7 - e.days.length; j++ ) {
						cells.push( <td key={ 'w' + i + 'e' + j }></td> );
					}
				}

				cells.push( <td key={ 'total' + i }>{ this.numberFormat( e.total ) }</td> );
				cells.push( <td key={ 'average' + i }>{ this.numberFormat( e.average ) }</td> );

				if ( 'number' === typeof ( e.change ) ) {
					changeClass = classNames( {
						'value-rising': e.change > 0,
						'value-falling': e.change < 0
					} );

					if ( e.change > 0 ) {
						iconType = 'arrow-up';
					}

					if ( e.change < 0 ) {
						iconType = 'arrow-down';
					}

					cells.push( <td className={ changeClass } key={ 'change' + i }><span className="value"><Gridicon icon={ iconType } size={ 18 } />{ this.numberFormat( e.change, 2 ) }%</span></td> );
				} else if ( 'object' === typeof ( e.change ) && null !== e.change && e.change.isInfinity ) {
					cells.push( <td key={ 'change' + i }>&infin;</td> );
				} else {
					cells.push( <td className="no-data" key={ 'change' + i }></td> );
				}

				return ( <tr key={ i }>{ cells }</tr> );
			}, this );

			tableBody = ( <tbody>{ tableRows }</tbody> );
		}

		return (
			<Card className={ classNames.apply( null, classes ) }>
				<div className="module-header">
					<h4 className="module-header-title">{ this.translate( 'Recent Weeks' ) }</h4>
					<ul className="module-header-actions">
						<li className="module-header-action toggle-info">
							<a href="#" className="module-header-action-link" aria-label={ this.translate( 'Show or hide panel information', { textOnly: true, context: 'Stats panel action' } ) } title={ this.translate( 'Show or hide panel information', { textOnly: true, context: 'Stats panel action' } ) } onClick={ this.toggleInfo } >
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


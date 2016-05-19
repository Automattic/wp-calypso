/**
 * External dependencies
 */
var React = require( 'react' ),
	isEmpty = require( 'lodash/isEmpty' ),
	classnames = require( 'classnames' ),
	i18n = require( 'i18n-calypso' ),
	debug = require( 'debug' )( 'calypso:vip:logs' );

/**
 * Internal dependencies
 */
var Card = require( 'components/card' ),
	SectionHeader = require( 'components/section-header' );

module.exports = React.createClass( {
	displayName: 'viplogsTable',

	componentWillMount: function() {
		debug( 'Mounting VIP Logs Table React component.' );
	},

	formatDate: function( date ) {
		return i18n.moment( date ).format( 'MMM D, HH:MM:SS' );
	},

	renderRows: function() {
		var rows = [];

		if ( ! this.props.logs ) {
			return (
				<tr className="vip-logs__no-results">
					<td className="vip-logs__no-results-cell" colSpan="2">{ this.translate( 'Loading…' ) }</td>
				</tr>
			);
		} else if ( isEmpty( this.props.logs ) ) {
			return (
				<tr className="vip-logs__no-results">
					<td className="vip-logs__no-results-cell" colSpan="2">{ this.translate( 'Your site is running smoothly' ) }</td>
				</tr>
			);
		}

		rows = this.props.logs.map( function( log, i ) {
			var prefix;

			// implement filtering
			if ( this.props.status && this.props.status !== log.type ) {
				return;
			}

			// implement search
			if ( this.props.search && log.log.toLowerCase().indexOf( this.props.search.toLowerCase() ) === -1 ) {
				return;
			}

			switch ( log.type ) {
				case 'error':
					prefix = this.translate( 'Error:', { context: 'Prefix label for PHP logs' } );
					break;
				case 'warning':
					prefix = this.translate( 'Warning:', { context: 'Prefix label for PHP logs' } );
					break;
				case 'notice':
					prefix = this.translate( 'Notice:', { context: 'Prefix label for PHP logs' } );
					break;
			}

			return (
				<tr key={ i } className={ classnames( 'vip-logs__log', 'vip-logs__log-' + log.type ) }>
					<td className="vip-logs__date"> { this.formatDate( log.timestamp ) }</td>
					<td className="vip-logs__log">
						<span className={ classnames( 'vip-logs__log-prefix', 'vip-logs__log-prefix-' + log.type ) }>{ prefix }</span>
						{ log.log }
					</td>
				</tr>
			);
		}, this );

		// search without results
		rows = rows.filter( function( row ) {
			return row;
		} ); // removes undefined items from the array

		if ( isEmpty( rows ) ) {
			rows.push(
				<tr key="none" className="vip-logs__no-results">
					<td className="vip-logs__no-results-cell" colSpan="2">
						{
							this.translate( 'No logs found for your search: {{searchTerm/}}.', {
								components: {
									searchTerm: <em>{ this.props.search }</em>
								}
							} )
						}
					</td>
				</tr>
			);
		}
		return rows;
	},

	render: function() {
		return (
			<div>
				<SectionHeader label={ this.translate( 'Logs' ) } />
				<Card>
					<table className="vip-logs__table">
						<thead className="screen-reader-text">
							<tr>
								<th className="vip-logs__date">{ this.translate( 'Date/Time' ) }</th>
								<th className="vip-logs__log">{ this.translate( 'Log' ) }</th>
							</tr>
						</thead>
						<tbody>
							{ this.renderRows() }
						</tbody>
					</table>
				</Card>
			</div>
		);
	}
} );

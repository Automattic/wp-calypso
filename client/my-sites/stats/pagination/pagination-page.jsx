/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var Gridicon = require( 'components/gridicon' );

module.exports = React.createClass( {

	displayName: 'StatModulePaginationPage',

	propTypes: {
		pageNumber: React.PropTypes.node.isRequired,
		currentPage: React.PropTypes.number.isRequired,
		totalPages: React.PropTypes.number.isRequired,
		pageClick: React.PropTypes.func.isRequired
	},

	clickHandler: function( event ) {
		event.stopPropagation();
		switch ( this.props.pageNumber ) {
			case '<--':
				if ( ( this.props.currentPage - 1 ) < 1 ) {
					return;
				}
				this.props.pageClick( this.props.currentPage - 1 );
				break;
			case '-->':
				if ( ( this.props.currentPage + 1 ) > this.props.totalPages ) {
					return;
				}
				this.props.pageClick( this.props.currentPage + 1 );
				break;
			default:
				if ( this.props.currentPage === this.props.pageNumber ) {
					return;
				}
				this.props.pageClick( this.props.pageNumber );
				break;
		}
	},

	render: function() {
		var listClass,
			pageNumberElement;

		switch ( this.props.pageNumber ) {
			case '...':
				pageNumberElement = <li className="stats-pagination__list-item stats-pagination__ellipsis" aria-hidden="true">&hellip;</li>;
				break;
			case '<--':
				listClass = classNames( 'stats-pagination__list-item stats-pagination__arrow', 'is-left', { 'is-active': this.props.currentPage > 1 } );
				pageNumberElement = <li className={ listClass } onClick={ this.clickHandler } tabIndex="0"><Gridicon icon="arrow-left" /></li>;
				break;
			case '-->':
				listClass = classNames( 'stats-pagination__list-item stats-pagination__arrow', 'is-right', { 'is-active': this.props.currentPage < this.props.totalPages } );
				pageNumberElement = <li className={ listClass } onClick={ this.clickHandler } tabIndex="0"><Gridicon icon="arrow-right" /></li>;
				break;
			default:
				listClass = classNames( 'stats-pagination__list-item stats-pagination__page-number', { 'is-selected': this.props.currentPage === this.props.pageNumber } );
				pageNumberElement = <li className={ listClass } onClick={ this.clickHandler } tabIndex="0">{ this.numberFormat( this.props.pageNumber ) }</li>;
				break;
		}
		return pageNumberElement;
	}
} );

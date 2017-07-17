/**
 * External dependencies
 */
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'gridicons';

class PaginationPage extends Component {
	static propTypes = {
		pageNumber: React.PropTypes.node.isRequired,
		currentPage: React.PropTypes.number.isRequired,
		totalPages: React.PropTypes.number.isRequired,
		pageClick: React.PropTypes.func.isRequired,
	}

	clickHandler = ( event ) => {
		event.stopPropagation();
		switch ( this.props.pageNumber ) {
			case '<--':
				if ( this.props.currentPage - 1 < 1 ) {
					return;
				}
				this.props.pageClick( this.props.currentPage - 1 );
				break;
			case '-->':
				if ( this.props.currentPage + 1 > this.props.totalPages ) {
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
	}

	render() {
		const { numberFormat } = this.props;
		let listClass, pageNumberElement;

		switch ( this.props.pageNumber ) {
			case '...':
				pageNumberElement = (
					<li className="pagination__list-item pagination__ellipsis" aria-hidden="true">
						&hellip;
					</li>
				);
				break;
			case '<--':
				listClass = classNames( 'pagination__list-item pagination__arrow', 'is-left', {
					'is-active': this.props.currentPage > 1,
				} );
				pageNumberElement = (
					<li className={ listClass } onClick={ this.clickHandler } tabIndex="0">
						<Gridicon icon="arrow-left" />
					</li>
				);
				break;
			case '-->':
				listClass = classNames( 'pagination__list-item pagination__arrow', 'is-right', {
					'is-active': this.props.currentPage < this.props.totalPages,
				} );
				pageNumberElement = (
					<li className={ listClass } onClick={ this.clickHandler } tabIndex="0">
						<Gridicon icon="arrow-right" />
					</li>
				);
				break;
			default:
				listClass = classNames( 'pagination__list-item pagination__page-number', {
					'is-selected': this.props.currentPage === this.props.pageNumber,
				} );
				pageNumberElement = (
					<li className={ listClass } onClick={ this.clickHandler } tabIndex="0">
						{ numberFormat( this.props.pageNumber ) }
					</li>
				);
				break;
		}
		return pageNumberElement;
	}
}

export default localize( PaginationPage );

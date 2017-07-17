/**
 * External dependencies
 */
import classNames from 'classnames';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';

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
						<span>&hellip;</span>
					</li>
				);
				break;
			case '<--':
				listClass = classNames( 'pagination__list-item pagination__arrow', 'is-left', {
					'is-active': this.props.currentPage > 1,
				} );
				pageNumberElement = (
					<li className={ listClass }>
						<Button borderless onClick={ this.clickHandler } disabled={ this.props.currentPage <= 1 }>
							<Gridicon icon="arrow-left" />
						</Button>
					</li>
				);
				break;
			case '-->':
				listClass = classNames( 'pagination__list-item pagination__arrow', 'is-right', {
					'is-active': this.props.currentPage < this.props.totalPages,
				} );
				pageNumberElement = (
					<li className={ listClass }>
						<Button borderless onClick={ this.clickHandler } disabled={ this.props.currentPage >= this.props.totalPages }>
							<Gridicon icon="arrow-right" />
						</Button>
					</li>
				);
				break;
			default:
				listClass = classNames( 'pagination__list-item pagination__page-number', {
					'is-selected': this.props.currentPage === this.props.pageNumber,
				} );
				pageNumberElement = (
					<li className={ listClass }>
						<Button borderless onClick={ this.clickHandler }>
							{ numberFormat( this.props.pageNumber ) }
						</Button>
					</li>
				);
				break;
		}
		return pageNumberElement;
	}
}

export default localize( PaginationPage );

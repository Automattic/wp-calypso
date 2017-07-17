/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import PaginationPage from './pagination-page';

class Pagination extends Component {
	static propTypes = {
		page: React.PropTypes.number.isRequired,
		perPage: React.PropTypes.number.isRequired,
		total: React.PropTypes.number,
		pageClick: React.PropTypes.func.isRequired,
	}

	render() {
		const { page, perPage, total } = this.props;
		let pageList = [];
		const pageCount = Math.ceil( total / perPage );

		if ( pageCount > 1 ) {
			pageList = [
				1,
				page - 2,
				page - 1,
				page,
				page + 1,
				page + 2,
				pageCount,
			];
			pageList.sort( function( a, b ) {
				return a - b;
			} );

			// Remove pages less than 1, or greater than total number of pages, and remove duplicates
			pageList = pageList.filter( function( pageNumber, index, originalPageList ) {
				return (
					pageNumber >= 1 &&
					pageNumber <= pageCount &&
					originalPageList.lastIndexOf( pageNumber ) === index
				);
			} );

			for ( let i = pageList.length - 2; i >= 0; i-- ) {
				if ( 2 === pageList[ i + 1 ] - pageList[ i ] ) {
					// Don't use ... if there's only 1 number being omitted, that's wasteful :)
					pageList.splice( i + 1, 0, pageList[ i + 1 ] - 1 );
				} else if ( pageList[ i + 1 ] - pageList[ i ] > 1 ) {
					pageList.splice( i + 1, 0, '...' );
				}
			}

			// Arrows are always present, whether or not they are active is determined in the pagination page module
			pageList.unshift( '-->' );
			pageList.unshift( '<--' );

			pageList = pageList.map( function( pageNumber, index ) {
				return (
					<PaginationPage
						key={ index }
						pageNumber={ pageNumber }
						currentPage={ page }
						totalPages={ pageCount }
						pageClick={ this.props.pageClick }
					/>
				);
			}, this );
		}

		if ( pageCount <= 1 ) {
			return null;
		}

		return (
			<div className="pagination">
				<ul className="pagination__list">
					{ pageList }
				</ul>
			</div>
		);
	}
}

export default Pagination;

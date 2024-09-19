import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Component } from 'react';
import {
	PaginationVariant,
	PaginationLeftDefaultIcon,
	PaginationRightDefaultIcon,
} from './constants';
import PaginationPage from './pagination-page';

import './style.scss';

class Pagination extends Component {
	static propTypes = {
		compact: PropTypes.bool,
		nextLabel: PropTypes.string,
		page: PropTypes.number.isRequired,
		pageClick: PropTypes.func.isRequired,
		perPage: PropTypes.number.isRequired,
		prevLabel: PropTypes.string,
		total: PropTypes.number,
		variant: PropTypes.oneOf( Object.values( PaginationVariant ) ),
		getPageList: PropTypes.func,
		paginationLeftIcon: PropTypes.string,
		paginationRightIcon: PropTypes.string,
	};

	static defaultProps = {
		variant: PaginationVariant.outlined,
		paginationLeftIcon: PaginationLeftDefaultIcon,
		paginationRightIcon: PaginationRightDefaultIcon,
	};

	getPageList = ( page, pageCount ) => {
		let pageList = [ 1, page - 2, page - 1, page, page + 1, page + 2, pageCount ];
		pageList.sort( ( a, b ) => a - b );

		// Remove pages less than 1, or greater than total number of pages, and remove duplicates
		pageList = pageList.filter( ( pageNumber, index, originalPageList ) => {
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
				pageList.splice( i + 1, 0, 'more' ); // This string is only for internal use, don't need translation
			}
		}

		// Arrows are always present, whether or not they are active is determined in the pagination page module
		// These strings are converted to gridicons in PaginationPage, no translation needed
		pageList.unshift( 'previous' ); // Prepend to beginning
		pageList.push( 'next' ); // Append to end

		return pageList;
	};

	render() {
		const {
			className,
			compact,
			nextLabel,
			page,
			pageClick,
			perPage,
			prevLabel,
			total,
			variant,
			getPageList,
			paginationLeftIcon,
			paginationRightIcon,
		} = this.props;
		const pageCount = Math.ceil( total / perPage );

		if ( pageCount <= 1 ) {
			return null;
		}

		const pageList = getPageList
			? getPageList( page, pageCount )
			: this.getPageList( page, pageCount );
		const pageListRendered = pageList.map( ( pageNumber, index ) => {
			return (
				<PaginationPage
					key={ index }
					compact={ compact }
					currentPage={ page }
					nextLabel={ nextLabel }
					pageClick={ pageClick }
					pageNumber={ pageNumber }
					prevLabel={ prevLabel }
					totalPages={ pageCount }
					paginationLeftIcon={ paginationLeftIcon }
					paginationRightIcon={ paginationRightIcon }
				/>
			);
		} );

		return (
			<div
				className={ clsx( 'pagination', className, {
					'is-compact': compact,
					'is-minimal': variant === PaginationVariant.minimal,
				} ) }
			>
				<ul className="pagination__list">{ pageListRendered }</ul>
			</div>
		);
	}
}

export default Pagination;

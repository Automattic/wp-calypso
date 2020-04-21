/**
 * External dependencies
 */

import classNames from 'classnames';
import Gridicon from 'components/gridicon';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';

class PaginationPage extends Component {
	static propTypes = {
		compact: PropTypes.bool,
		currentPage: PropTypes.number.isRequired,
		nextLabel: PropTypes.string,
		pageClick: PropTypes.func.isRequired,
		pageNumber: PropTypes.node.isRequired,
		prevLabel: PropTypes.string,
		totalPages: PropTypes.number.isRequired,
	};

	clickHandler = ( event ) => {
		event.stopPropagation();
		const { currentPage, pageClick, pageNumber, totalPages } = this.props;

		switch ( pageNumber ) {
			case 'previous':
				if ( currentPage - 1 < 1 ) {
					return;
				}
				pageClick( currentPage - 1 );
				break;
			case 'next':
				if ( currentPage + 1 > totalPages ) {
					return;
				}
				pageClick( currentPage + 1 );
				break;
			default:
				if ( currentPage === pageNumber ) {
					return;
				}
				pageClick( pageNumber );
				break;
		}
	};

	render() {
		const {
			translate,
			currentPage,
			nextLabel,
			numberFormat,
			pageNumber,
			prevLabel,
			totalPages,
			compact,
		} = this.props;

		switch ( pageNumber ) {
			case 'more':
				return (
					<li className="pagination__list-item pagination__ellipsis" aria-hidden="true">
						<span>&hellip;</span>
					</li>
				);
			case 'previous': {
				const listClass = classNames( 'pagination__list-item pagination__arrow', 'is-left', {
					'is-active': currentPage > 1,
				} );
				return (
					<li className={ listClass }>
						<Button
							className="pagination__list-button"
							borderless
							onClick={ this.clickHandler }
							disabled={ currentPage <= 1 }
						>
							<Gridicon icon="arrow-left" size={ 18 } />
							{ ! compact && ( prevLabel || translate( 'Previous' ) ) }
						</Button>
					</li>
				);
			}
			case 'next': {
				const listClass = classNames( 'pagination__list-item pagination__arrow', 'is-right', {
					'is-active': currentPage < totalPages,
				} );
				return (
					<li className={ listClass }>
						<Button
							className="pagination__list-button"
							borderless
							onClick={ this.clickHandler }
							disabled={ currentPage >= totalPages }
						>
							{ ! compact && ( nextLabel || translate( 'Next' ) ) }
							<Gridicon icon="arrow-right" size={ 18 } />
						</Button>
					</li>
				);
			}
			default: {
				const listClass = classNames( 'pagination__list-item pagination__page-number', {
					'is-selected': currentPage === pageNumber,
				} );
				return (
					<li className={ listClass }>
						<Button className="pagination__list-button" borderless onClick={ this.clickHandler }>
							{ numberFormat( pageNumber ) }
						</Button>
					</li>
				);
			}
		}
	}
}

export default localize( PaginationPage );

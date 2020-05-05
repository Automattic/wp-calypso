/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { includes, filter, map, noop, reduce, union } from 'lodash';
import { WindowScroller } from '@automattic/react-virtualized';

/**
 * Internal dependencies
 */
import VirtualList from 'components/virtual-list';
import ListItem from './list-item';
import { CompactCard } from '@automattic/components';
import QueryTerms from 'components/data/query-terms';
import QuerySiteSettings from 'components/data/query-site-settings';
import {
	isRequestingTermsForQueryIgnoringPage,
	getTermsLastPageForQuery,
	getTermsForQueryIgnoringPage,
} from 'state/terms/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

/**
 * Constants
 */
const DEFAULT_TERMS_PER_PAGE = 100;
const LOAD_OFFSET = 10;
const ITEM_HEIGHT = 55;

export class TaxonomyManagerList extends Component {
	static propTypes = {
		terms: PropTypes.array,
		taxonomy: PropTypes.string,
		search: PropTypes.string,
		siteId: PropTypes.number,
		translate: PropTypes.func,
		lastPage: PropTypes.number,
		onTermClick: PropTypes.func,
	};

	static defaultProps = {
		loading: true,
		terms: [],
		onNextPage: noop,
		onTermClick: noop,
	};

	state = {
		requestedPages: [ 1 ],
	};

	UNSAFE_componentWillMount() {
		this.termIds = map( this.props.terms, 'ID' );
	}

	UNSAFE_componentWillReceiveProps( newProps ) {
		if ( newProps.terms !== this.props.terms ) {
			this.termIds = map( newProps.terms, 'ID' );
		}
	}

	getTermChildren( termId ) {
		const { terms } = this.props;
		return filter( terms, { parent: termId } );
	}

	getItemHeight = ( item, _recurse = false ) => {
		if ( ! item ) {
			return ITEM_HEIGHT;
		}

		// if item has a parent, and parent is in payload, height is already part of parent
		if ( item.parent && ! _recurse && includes( this.termIds, item.parent ) ) {
			return 0;
		}

		return reduce(
			this.getTermChildren( item.ID ),
			( memo, childItem ) => {
				return memo + this.getItemHeight( childItem, true );
			},
			ITEM_HEIGHT
		);
	};

	getRowHeight = ( { index } ) => {
		return this.getItemHeight( this.getItem( index ) );
	};

	getItem( index ) {
		if ( this.props.terms ) {
			return this.props.terms[ index ];
		}
	}

	renderItem( item, _recurse = false ) {
		// if item has a parent and it is in current props.terms, do not render
		if ( item.parent && ! _recurse && includes( this.termIds, item.parent ) ) {
			return;
		}
		const children = this.getTermChildren( item.ID );
		const { onTermClick, taxonomy } = this.props;
		const itemId = item.ID;
		const onClick = () => onTermClick( item );

		return (
			<div key={ 'term-wrapper-' + itemId } className="taxonomy-manager__list-item">
				<CompactCard key={ itemId } className="taxonomy-manager__list-item-card">
					<ListItem onClick={ onClick } taxonomy={ taxonomy } term={ item } />
				</CompactCard>
				{ children.length > 0 && (
					<div className="taxonomy-manager__nested-list">
						{ children.map( ( child ) => this.renderItem( child, true ) ) }
					</div>
				) }
			</div>
		);
	}

	renderRow = ( { index } ) => {
		const item = this.getItem( index );
		if ( item ) {
			return this.renderItem( item );
		}

		return (
			<CompactCard className="taxonomy-manager__list-item is-placeholder">
				<span className="taxonomy-manager__label">{ this.props.translate( 'Loading…' ) }</span>
			</CompactCard>
		);
	};

	requestPages = ( pages ) => {
		this.setState( {
			requestedPages: union( this.state.requestedPages, pages ),
		} );
	};

	render() {
		const { loading, siteId, taxonomy, terms, lastPage, query } = this.props;
		const classes = classNames( 'taxonomy-manager', {
			'is-loading': loading,
		} );
		const hasDefaultSetting = taxonomy === 'category';

		return (
			<div className={ classes }>
				{ this.state.requestedPages.map( ( page ) => (
					<QueryTerms
						key={ `query-${ page }` }
						siteId={ siteId }
						taxonomy={ taxonomy }
						query={ { ...query, page } }
					/>
				) ) }
				{ hasDefaultSetting && <QuerySiteSettings siteId={ siteId } /> }

				<WindowScroller>
					{ ( { height, scrollTop } ) => (
						<VirtualList
							items={ terms }
							lastPage={ lastPage }
							loading={ loading }
							getRowHeight={ this.getRowHeight }
							renderRow={ this.renderRow }
							onRequestPages={ this.requestPages }
							perPage={ DEFAULT_TERMS_PER_PAGE }
							loadOffset={ LOAD_OFFSET }
							searching={ query.search && query.search.length }
							defaultRowHeight={ ITEM_HEIGHT }
							height={ height }
							scrollTop={ scrollTop }
						/>
					) }
				</WindowScroller>
			</div>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const { taxonomy, query } = ownProps;
	const siteId = getSelectedSiteId( state );

	return {
		loading: isRequestingTermsForQueryIgnoringPage( state, siteId, taxonomy, query ),
		terms: getTermsForQueryIgnoringPage( state, siteId, taxonomy, query ),
		lastPage: getTermsLastPageForQuery( state, siteId, taxonomy, query ),
		siteId,
		query,
	};
} )( localize( TaxonomyManagerList ) );

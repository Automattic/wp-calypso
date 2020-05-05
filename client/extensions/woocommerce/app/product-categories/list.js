/**
 * External dependencies
 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { map, filter, reduce, includes } from 'lodash';
import { WindowScroller } from '@automattic/react-virtualized';

/**
 * Internal dependencies
 */
import {
	areAnyProductCategoriesLoading,
	areProductCategoriesLoaded,
	getAllProductCategories,
	getAllProductCategoriesBySearch,
	getProductCategoriesLastPage,
	getTotalProductCategories,
} from 'woocommerce/state/sites/product-categories/selectors';
import Count from 'components/count';
import { CompactCard } from '@automattic/components';
import { DEFAULT_QUERY } from 'woocommerce/state/sites/product-categories/utils';
import EmptyContent from 'components/empty-content';
import { fetchProductCategories } from 'woocommerce/state/sites/product-categories/actions';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import VirtualList from 'components/virtual-list';
import { stripHTML, decodeEntities } from 'lib/formatting';
import ImageThumb from 'woocommerce/components/image-thumb';

const ITEM_HEIGHT = 70;

class ProductCategories extends Component {
	UNSAFE_componentWillMount() {
		this.catIds = map( this.props.categories, 'id' );
	}

	UNSAFE_componentWillReceiveProps( newProps ) {
		if ( newProps.categories !== this.props.categories ) {
			this.catIds = map( newProps.categories, 'id' );
		}
	}

	getChildren( id ) {
		const { categories } = this.props;
		return filter( categories, { parent: id } );
	}

	getItemHeight = ( item, _recurse = false ) => {
		if ( ! item ) {
			return ITEM_HEIGHT;
		}

		// if item has a parent, and parent is in payload, height is already part of parent
		if ( item.parent && ! _recurse && includes( this.catIds, item.parent ) ) {
			return 0;
		}

		return reduce(
			this.getChildren( item.id ),
			( height, childItem ) => {
				return height + this.getItemHeight( childItem, true );
			},
			ITEM_HEIGHT
		);
	};

	getRowHeight = ( { index } ) => {
		return this.getItemHeight( this.getItem( index ) );
	};

	getItem( index ) {
		if ( this.props.categories ) {
			return this.props.categories[ index ];
		}
	}

	renderItem( item, _recurse = false ) {
		const { site } = this.props;

		// if item has a parent and it is in current props.categories, do not render
		if ( item.parent && ! _recurse && includes( this.catIds, item.parent ) ) {
			return;
		}
		const children = this.getChildren( item.id );
		const itemId = item.id;
		const link = getLink( '/store/products/category/:site/' + itemId, site );
		const description = decodeEntities( stripHTML( item.description ) );

		return (
			<div key={ 'product-category-' + itemId } className="product-categories__list-item">
				<CompactCard key={ itemId } className="product-categories__list-item-card" href={ link }>
					<div className="product-categories__list-item-wrapper">
						<div className="product-categories__list-thumb">
							<ImageThumb src={ ( item.image && item.image.src ) || '' } alt="" />
						</div>
						<span className="product-categories__list-item-info">
							<span className="product-categories__list-item-name">{ item.name }</span>
							<Count count={ item.count } />
							<span className="product-categories__list-item-description">{ description }</span>
						</span>
					</div>
				</CompactCard>
				{ children.length > 0 && (
					<div className="product-categories__list-nested">
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

		return null;
	};

	renderCategoryList() {
		const { loading, categories, lastPage, searchQuery } = this.props;
		return (
			<WindowScroller>
				{ ( { height, scrollTop } ) => (
					<VirtualList
						items={ categories }
						lastPage={ lastPage }
						loading={ loading }
						getRowHeight={ this.getRowHeight }
						renderRow={ this.renderRow }
						onRequestPages={ this.props.requestPages }
						perPage={ DEFAULT_QUERY.per_page }
						loadOffset={ 10 }
						searching={ searchQuery && searchQuery.length }
						defaultRowHeight={ ITEM_HEIGHT }
						height={ height }
						scrollTop={ scrollTop }
					/>
				) }
			</WindowScroller>
		);
	}

	render() {
		const { className, translate, totalCategories, searchQuery } = this.props;

		if ( this.props.isInitialRequestLoaded && 0 === totalCategories ) {
			let message = null;
			if ( searchQuery ) {
				message = translate( 'No product categories found for {{query /}}.', {
					components: {
						query: <em>{ searchQuery }</em>,
					},
				} );
			}
			return (
				<EmptyContent title={ translate( 'No product categories found.' ) } line={ message } />
			);
		}

		const classes = classNames( 'product-categories__list', className );

		return (
			<div className="product-categories__list-container">
				<div className={ classes }>
					{ ( this.props.isInitialRequestLoaded && this.renderCategoryList() ) || (
						<div className="product-categories__list-placeholder" />
					) }
				</div>
			</div>
		);
	}
}

function mapStateToProps( state, ownProps ) {
	const { searchQuery } = ownProps;
	const query = {};
	if ( searchQuery && searchQuery.length ) {
		query.search = searchQuery;
	}

	const site = getSelectedSiteWithFallback( state );
	const loading = areAnyProductCategoriesLoading( state );
	const isInitialRequestLoaded = areProductCategoriesLoaded( state, query ); // first page request
	const categories = query.search
		? getAllProductCategoriesBySearch( state, query.search )
		: getAllProductCategories( state );
	const totalCategories = getTotalProductCategories( state, query );
	const lastPage = getProductCategoriesLastPage( state, query );
	return {
		site,
		loading,
		categories,
		lastPage,
		isInitialRequestLoaded,
		totalCategories,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			fetchProductCategories,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( ProductCategories ) );

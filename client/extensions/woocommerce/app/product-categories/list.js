/**
 * External dependencies
 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { map, filter, reduce, includes } from 'lodash';
import page from 'page';
import WindowScroller from 'react-virtualized/WindowScroller';

/**
 * Internal dependencies
 */
import {
	areProductCategoriesLoadingIgnoringPage,
	getProductCategoriesLastPage,
	getProductCategoriesIgnoringPage,
	areProductCategoriesLoaded,
	getTotalProductCategories,
} from 'woocommerce/state/sites/product-categories/selectors';
import Count from 'components/count';
import CompactCard from 'components/card/compact';
import { DEFAULT_QUERY } from 'woocommerce/state/sites/product-categories/utils';
import EmptyContent from 'components/empty-content';
import { fetchProductCategories } from 'woocommerce/state/sites/product-categories/actions';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import VirtualList from 'components/virtual-list';
import { stripHTML, decodeEntities } from 'lib/formatting';

const ITEM_HEIGHT = 70;

class ProductCategories extends Component {

	componentWillMount() {
		this.catIds = map( this.props.categories, 'id' );
	}

	componentWillReceiveProps( newProps ) {
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
		const image = item.image && item.image.src;
		const imageClasses = classNames( 'product-categories__list-item-icon', {
			'is-thumb-placeholder': ! image,
		} );
		const link = getLink( '/store/products/category/:site/' + itemId, site );

		const goToLink = () => {
			page( link );
		};

		const description = decodeEntities( stripHTML( item.description ) );

		return (
			<div key={ 'product-category-' + itemId } className="product-categories__list-item">
				<CompactCard key={ itemId } className="product-categories__list-item-card" onClick={ goToLink }>
					<div className="product-categories__list-item-wrapper">
						<div className="product-categories__list-thumb">
							<div className={ imageClasses }>
								<figure>
									{ item.image && <img src={ item.image.src } /> }
								</figure>
							</div>
						</div>
						<span className="product-categories__list-item-info">
							<a href={ link }>{ item.name }</a>
							<Count count={ item.count } />
							<span className="product-categories__list-item-description">{ description }</span>
						</span>
					</div>
				</CompactCard>
					{ children.length > 0 && (
						<div className="product-categories__list-nested">
							{ children.map( child => this.renderItem( child, true ) ) }
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
				{( { height, scrollTop } ) => (
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
				)}
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
			return <EmptyContent title={ translate( 'No product categories found.' ) } line={ message } />;
		}

		const classes = classNames( 'product-categories__list', className );

		return (
			<div className="product-categories__list-container">
				<div className={ classes }>
					{
						this.props.isInitialRequestLoaded && this.renderCategoryList() ||
						<div className="product-categories__list-placeholder" />
					}
				</div>
			</div>
		);
	}

}

function mapStateToProps( state, ownProps ) {
	const { searchQuery } = ownProps;
	let query = {};
	if ( searchQuery && searchQuery.length ) {
		query = { search: searchQuery, ...query };
	}

	const site = getSelectedSiteWithFallback( state );
	const loading = areProductCategoriesLoadingIgnoringPage( state, query );
	const isInitialRequestLoaded = areProductCategoriesLoaded( state, query ); // first page request
	const categories = getProductCategoriesIgnoringPage( state, query );
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

/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';
import { isEmpty, omit, debounce } from 'lodash';
import page from 'page';

/**
 * Internal dependencies
 */
import accept from 'lib/accept';
import Main from 'components/main';
import { ProtectFormGuard } from 'lib/protect-form';
import {
	fetchProductCategories,
	updateProductCategory,
	deleteProductCategory,
} from 'woocommerce/state/sites/product-categories/actions';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import {
	editProductCategory,
	clearProductCategoryEdits,
} from 'woocommerce/state/ui/product-categories/actions';
import {
	getProductCategoryWithLocalEdits,
	getProductCategoryEdits,
} from 'woocommerce/state/ui/product-categories/selectors';
import { getLink } from 'woocommerce/lib/nav-utils';
import ProductCategoryForm from './form';
import ProductCategoryHeader from './header';
import { successNotice, errorNotice } from 'state/notices/actions';

class ProductCategoryUpdate extends React.Component {
	static propTypes = {
		params: PropTypes.object,
		className: PropTypes.string,
		site: PropTypes.shape( {
			ID: PropTypes.number,
			slug: PropTypes.string,
		} ),
		category: PropTypes.shape( {
			id: PropTypes.isRequired,
		} ),
		fetchProductCategories: PropTypes.func.isRequired,
		editProductCategory: PropTypes.func.isRequired,
		clearProductCategoryEdits: PropTypes.func.isRequired,
	};

	state = {
		busy: false,
	};

	componentDidMount() {
		const { params, site, category } = this.props;
		const categoryId = Number( params.category );

		if ( site && site.ID ) {
			if ( ! category ) {
				this.props.fetchProductCategories( site.ID, { include: [ categoryId ] } );
				this.props.editProductCategory( site.ID, { id: categoryId }, {} );
			}
		}
	}

	componentWillReceiveProps( newProps ) {
		const { params, site } = this.props;
		const categoryId = Number( params.category );
		const newSiteId = ( newProps.site && newProps.site.ID ) || null;
		const oldSiteId = ( site && site.ID ) || null;
		if ( oldSiteId !== newSiteId ) {
			this.props.fetchProductCategories( newSiteId, { include: [ categoryId ] } );
			this.props.editProductCategory( newSiteId, { id: categoryId }, {} );
		}
	}

	componentWillUnmount() {
		const { site } = this.props;

		if ( site ) {
			this.props.clearProductCategoryEdits( site.ID );
		}
	}

	onDelete = () => {
		const { translate, site, category, deleteProductCategory: dispatchDelete } = this.props;
		const areYouSure = translate( "Are you sure you want to permanently delete '%(name)s'?", {
			args: { name: category.name },
		} );
		accept( areYouSure, function( accepted ) {
			if ( ! accepted ) {
				return;
			}
			const successAction = () => {
				debounce( () => {
					page.redirect( getLink( '/store/products/categories/:site/', site ) );
				}, 2000 )();
				return successNotice(
					translate( '%(name)s successfully deleted.', {
						args: { name: category.name },
					} )
				);
			};
			const failureAction = () => {
				return errorNotice(
					translate( 'There was a problem deleting %(name)s. Please try again.', {
						args: { name: category.name },
					} )
				);
			};
			dispatchDelete( site.ID, category, successAction, failureAction );
		} );
	};

	onSave = () => {
		const { site, category, translate } = this.props;
		this.setState( () => ( { busy: true } ) );

		const successAction = () => {
			page.redirect( getLink( '/store/products/categories/:site', site ) );
			return successNotice( translate( 'Category successfully updated.' ), {
				displayOnNextPage: true,
				duration: 8000,
			} );
		};

		const failureAction = () => {
			this.setState( () => ( { busy: false } ) );
			return errorNotice(
				translate( 'There was a problem saving your category. Please try again.' ),
				{
					duration: 8000,
				}
			);
		};

		this.props.updateProductCategory( site.ID, category, successAction, failureAction );
	};

	render() {
		const { site, category, hasEdits, className } = this.props;
		const { busy } = this.state;

		return (
			<Main className={ className } wideLayout>
				<ProductCategoryHeader
					site={ site }
					category={ category }
					onDelete={ this.onDelete }
					onSave={ hasEdits ? this.onSave : false }
					isBusy={ busy }
				/>
				<ProtectFormGuard isChanged={ hasEdits } />
				<ProductCategoryForm
					siteId={ site && site.ID }
					category={ category || {} }
					editProductCategory={ this.props.editProductCategory }
				/>
			</Main>
		);
	}
}

function mapStateToProps( state, ownProps ) {
	const categoryId = Number( ownProps.params.category );

	const site = getSelectedSiteWithFallback( state );
	const category = getProductCategoryWithLocalEdits( state, categoryId );
	const hasEdits = ! isEmpty( omit( getProductCategoryEdits( state, categoryId ), 'id' ) );

	return {
		site,
		category,
		hasEdits,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			editProductCategory,
			fetchProductCategories,
			clearProductCategoryEdits,
			updateProductCategory,
			deleteProductCategory,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( ProductCategoryUpdate ) );

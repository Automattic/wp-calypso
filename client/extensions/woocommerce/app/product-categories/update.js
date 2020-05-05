/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';
import { isEmpty, omit, debounce, isNull } from 'lodash';
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
import { recordTrack } from 'woocommerce/lib/analytics';
import { successNotice, errorNotice } from 'state/notices/actions';
import { getSaveErrorMessage } from './utils';
import { withAnalytics } from 'state/analytics/actions';

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
		isUploading: false,
	};

	componentDidMount() {
		const { params, site, category } = this.props;
		const categoryId = Number( params.category_id );

		if ( site && site.ID ) {
			if ( ! category ) {
				this.props.fetchProductCategories( site.ID, { include: [ categoryId ] } );
				this.props.editProductCategory( site.ID, { id: categoryId }, {} );
			}
		}
	}

	UNSAFE_componentWillReceiveProps( newProps ) {
		const { params, site } = this.props;
		const categoryId = Number( params.category_id );
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

	onUploadStart = () => {
		this.setState( { isUploading: true } );
	};

	onUploadFinish = () => {
		this.setState( { isUploading: false } );
	};

	onDelete = () => {
		const {
			translate,
			site,
			category,
			deleteProductCategory: dispatchDelete,
			clearProductCategoryEdits: clearEdits,
		} = this.props;
		const areYouSure = translate( "Are you sure you want to permanently delete '%(name)s'?", {
			args: { name: category.name },
		} );
		accept( areYouSure, function ( accepted ) {
			if ( ! accepted ) {
				return;
			}

			clearEdits( site.ID );

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

		const failureAction = ( dispatch, getState, passedProps ) => {
			this.setState( { busy: false } );

			const { error } = passedProps;
			const errorSlug = ( error && error.error ) || undefined;

			return errorNotice( getSaveErrorMessage( errorSlug, translate ), {
				duration: 8000,
			} );
		};

		this.props.updateProductCategory( site.ID, category, successAction, failureAction );
	};

	render() {
		const { site, category, hasEdits, className } = this.props;
		const { busy, isUploading } = this.state;

		const saveEnabled =
			hasEdits &&
			category &&
			category.name &&
			category.name.length &&
			! isNull( category.parent ) &&
			! isUploading;

		return (
			<Main className={ className } wideLayout>
				<ProductCategoryHeader
					site={ site }
					category={ category }
					onDelete={ this.onDelete }
					onSave={ saveEnabled ? this.onSave : false }
					isBusy={ busy }
				/>
				<ProtectFormGuard isChanged={ hasEdits } />
				<ProductCategoryForm
					siteId={ site && site.ID }
					category={ category || {} }
					editProductCategory={ this.props.editProductCategory }
					onUploadStart={ this.onUploadStart }
					onUploadFinish={ this.onUploadFinish }
				/>
			</Main>
		);
	}
}

function mapStateToProps( state, ownProps ) {
	const categoryId = Number( ownProps.params.category_id );

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
			updateProductCategory: ( siteId, category, ...args ) =>
				withAnalytics(
					recordTrack( 'calypso_woocommerce_product_category_update', { id: category.id } ),
					updateProductCategory( siteId, category, ...args )
				),
			deleteProductCategory: ( siteId, category, ...args ) =>
				withAnalytics(
					recordTrack( 'calypso_woocommerce_product_category_delete', { id: category.id } ),
					deleteProductCategory( siteId, category, ...args )
				),
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( ProductCategoryUpdate ) );

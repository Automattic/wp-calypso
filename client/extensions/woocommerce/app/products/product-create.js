/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { head, isNumber } from 'lodash';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import { ProtectFormGuard } from 'lib/protect-form';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { successNotice, errorNotice } from 'state/notices/actions';
import {
	clearProductEdits,
	editProduct,
	editProductAttribute,
	createProductActionList,
} from 'woocommerce/state/ui/products/actions';
import {
	clearProductCategoryEdits,
	editProductCategory,
} from 'woocommerce/state/ui/product-categories/actions';
import { getActionList } from 'woocommerce/state/action-list/selectors';
import {
	getCurrentlyEditingId,
	getProductWithLocalEdits,
	getProductEdits,
} from 'woocommerce/state/ui/products/selectors';
import { getFinishedInitialSetup } from 'woocommerce/state/sites/setup-choices/selectors';
import { getProductVariationsWithLocalEdits } from 'woocommerce/state/ui/products/variations/selectors';
import { fetchProductCategories } from 'woocommerce/state/sites/product-categories/actions';
import {
	clearProductVariationEdits,
	editProductVariation,
} from 'woocommerce/state/ui/products/variations/actions';
import { getProductCategoriesWithLocalEdits } from 'woocommerce/state/ui/product-categories/selectors';
import ProductForm from './product-form';
import ProductHeader from './product-header';
import { getLink } from 'woocommerce/lib/nav-utils';
import { withAnalytics, recordTracksEvent } from 'state/analytics/actions';
import { getSaveErrorMessage } from './save-error-message';

class ProductCreate extends React.Component {
	static propTypes = {
		className: PropTypes.string,
		site: PropTypes.shape( {
			ID: PropTypes.number,
			slug: PropTypes.string,
		} ),
		product: PropTypes.shape( {
			id: PropTypes.isRequired,
		} ),
		fetchProductCategories: PropTypes.func.isRequired,
		editProduct: PropTypes.func.isRequired,
		editProductCategory: PropTypes.func.isRequired,
		editProductAttribute: PropTypes.func.isRequired,
		editProductVariation: PropTypes.func.isRequired,
	};

	state = {
		isUploading: [],
	};

	componentDidMount() {
		const { site } = this.props;

		if ( site && site.ID ) {
			this.props.editProduct( site.ID, null, {} );
			this.props.fetchProductCategories( site.ID, { offset: 0 } );
		}
	}

	UNSAFE_componentWillReceiveProps( newProps ) {
		const { site } = this.props;
		const newSiteId = ( newProps.site && newProps.site.ID ) || null;
		const oldSiteId = ( site && site.ID ) || null;
		if ( oldSiteId !== newSiteId ) {
			this.props.editProduct( newSiteId, null, {} );
			this.props.fetchProductCategories( newSiteId, { offset: 0 } );
		}
	}

	componentWillUnmount() {
		const { site } = this.props;

		if ( site ) {
			this.props.clearProductEdits( site.ID );
			this.props.clearProductCategoryEdits( site.ID );
			this.props.clearProductVariationEdits( site.ID );
		}
	}

	onUploadStart = () => {
		this.setState( ( prevState ) => ( {
			isUploading: [ ...prevState.isUploading, [ true ] ],
		} ) );
	};

	onUploadFinish = () => {
		this.setState( ( prevState ) => ( {
			isUploading: prevState.isUploading.slice( 1 ),
		} ) );
	};

	onSave = () => {
		const { site, product, finishedInitialSetup, translate } = this.props;

		const getSuccessNotice = ( newProduct ) => {
			if ( ! finishedInitialSetup ) {
				return successNotice(
					translate( '%(product)s successfully created. {{productLink}}View{{/productLink}}', {
						args: {
							product: newProduct.name,
						},
						components: {
							productLink: (
								<a href={ newProduct.permalink } target="_blank" rel="noopener noreferrer" />
							),
						},
					} ),
					{
						displayOnNextPage: true,
						showDismiss: false,
						button: translate( 'Back to dashboard' ),
						href: getLink( '/store/:site', site ),
					}
				);
			}

			return successNotice(
				translate( '%(product)s successfully created.', {
					args: { product: product.name },
				} ),
				{
					displayOnNextPage: true,
					duration: 8000,
					button: translate( 'View' ),
					onClick: () => {
						window.open( newProduct.permalink );
					},
				}
			);
		};

		const successAction = ( products ) => {
			const newProduct = head( products );
			page.redirect( getLink( '/store/products/:site', site ) );
			return getSuccessNotice( newProduct );
		};

		const failureAction = ( error ) => {
			const errorSlug = ( error && error.error ) || undefined;

			return errorNotice( getSaveErrorMessage( errorSlug, product.name, translate ), {
				duration: 8000,
			} );
		};

		if ( ! product.type ) {
			// Product type was never switched, so set it before we save.
			this.props.editProduct( site.ID, product, { type: 'simple' } );
		}

		if ( ! product.regular_price ) {
			this.props.editProduct( site.ID, product, { regular_price: '0' } );
		}

		this.props.createProductActionList( successAction, failureAction );
	};

	isProductValid( product = this.props.product ) {
		return product && product.name && product.name.length > 0;
	}

	render() {
		const {
			site,
			product,
			hasEdits,
			className,
			variations,
			productCategories,
			actionList,
		} = this.props;

		const isValid = 'undefined' !== site && this.isProductValid();
		const isBusy = Boolean( actionList ); // If there's an action list present, we're trying to save.
		const saveEnabled = isValid && ! isBusy && 0 === this.state.isUploading.length;

		if ( ! product || isNumber( product.id ) ) {
			return null;
		}

		return (
			<Main className={ className } wideLayout>
				<ProductHeader
					site={ site }
					product={ product }
					onSave={ saveEnabled ? this.onSave : false }
					isBusy={ isBusy }
				/>
				<ProtectFormGuard isChanged={ hasEdits } />
				<ProductForm
					siteId={ site && site.ID }
					product={ product || { type: 'simple' } }
					variations={ variations }
					productCategories={ productCategories }
					editProduct={ this.props.editProduct }
					editProductCategory={ this.props.editProductCategory }
					editProductAttribute={ this.props.editProductAttribute }
					editProductVariation={ this.props.editProductVariation }
					onUploadStart={ this.onUploadStart }
					onUploadFinish={ this.onUploadFinish }
				/>
			</Main>
		);
	}
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const productId = getCurrentlyEditingId( state );
	const combinedProduct = getProductWithLocalEdits( state, productId );
	const product = combinedProduct || ( productId && { id: productId } );
	const hasEdits = Boolean( getProductEdits( state, productId ) );
	const variations = product && getProductVariationsWithLocalEdits( state, product.id );
	const productCategories = getProductCategoriesWithLocalEdits( state );
	const actionList = getActionList( state );
	const finishedInitialSetup = getFinishedInitialSetup( state );

	return {
		site,
		product,
		hasEdits,
		variations,
		productCategories,
		actionList,
		finishedInitialSetup,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			createProductActionList: ( ...args ) =>
				withAnalytics(
					recordTracksEvent( 'calypso_woocommerce_ui_product_create' ),
					createProductActionList( ...args )
				),
			editProduct,
			editProductCategory,
			editProductAttribute,
			editProductVariation,
			fetchProductCategories,
			clearProductEdits,
			clearProductCategoryEdits,
			clearProductVariationEdits,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( ProductCreate ) );

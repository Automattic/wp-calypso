/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Button from 'components/button';

/**
 * Internal dependencies
 */
import TitleBar from '../../components/title-bar';
import ProductsBody from './body';
import * as actions from '../../state/product-list/actions';

// TODO: Restore redux state handling to this component.
//import { connect } from 'react-redux';
//import { bindActionCreators } from 'redux';
//import screenData from '../../utils/screen-data';
//import * as wcApi from '../../data/wc-api';
//import fetchConnect from '../../state/fetch-data/fetch-connect';
//import * as actions from '../../state/products/actions';

// TODO: Combine product-specific code from index and body into one file.
// TODO: Make the entire list-table component general and move it to client/components

// TODO: Do this in a more universal way.
//const data = screenData( 'wc_synchrotron_data' );

class ProductList extends React.Component {
	static propTypes = {
		productListState: PropTypes.object.isRequired,
		setDisplayOption: PropTypes.func.isRequired,
		initEdits: PropTypes.func.isRequired,
		addProduct: PropTypes.func.isRequired,
		editProduct: PropTypes.func.isRequired,
		cancelEdits: PropTypes.func.isRequired,
		saveEdits: PropTypes.func.isRequired,
		currencySymbol: PropTypes.string.isRequired,
		currencyIsPrefix: PropTypes.bool.isRequired,
		currencyDecimals: PropTypes.number.isRequired,
	}

	constructor( props ) {
		super( props );

		this.renderViewTitle = this.renderViewTitle.bind( this );
		this.renderEditTitle = this.renderEditTitle.bind( this );
	}

	render() {
		const { productListState, categories, taxClasses, setDisplayOption, editProduct } = this.props;
		const { currencySymbol, currencyIsPrefix, currencyDecimals } = this.props;
		const { edits, saving, display, products } = productListState;

		return (
			<div className="product-list">
				<div className="product-list__header">
					{ edits ? this.renderEditTitle() : this.renderViewTitle() }
				</div>
				<ProductsBody
					products={ products }
					categories={ categories }
					taxClasses={ taxClasses }
					edits={ edits }
					editable={ edits != null }
					disabled={ Boolean( saving ) }
					display={ display }
					setDisplayOption={ setDisplayOption }
					editProduct={ editProduct }
					currencySymbol={ currencySymbol }
					currencyIsPrefix={ currencyIsPrefix }
					currencyDecimals={ currencyDecimals }
				/>
			</div>
		);
	}

	renderViewTitle() {
		const __ = this.props.translate;
		const { initEdits, addProduct } = this.props;

		return (
			<TitleBar icon="product" title={ __( 'Products' ) }>
				<Button compact primary onClick={ addProduct } >{ __( 'Add product' ) }</Button>
				<Button compact onClick={ initEdits } >{ __( 'Edit products' ) }</Button>
			</TitleBar>
		);
	}

	onCancelClick() {
		this.props.cancelEdits();
	}

	onSaveClick() {
		const { edits } = this.props.productListState;
		this.props.saveEdits( edits );
	}

	renderEditTitle() {
		const __ = this.props.translate;
		const { edits, saving } = this.props.productListState;

		return (
			<TitleBar icon="product" title={ __( 'Products' ) }>
				<Button compact onClick={ this.onCancelClick } >{ __( 'Cancel' ) }</Button>
				<Button
					primary
					compact
					onClick={ this.onSaveClick }
					disabled={ saving || 0 === Object.keys( edits ).length }
				>
					{ ( saving ? __( 'Saving' ) : __( 'Save' ) ) }
				</Button>
			</TitleBar>
		);
	}
}

// TODO: Restore redux state handling to this component.
/*
function mapFetchProps() {
	return {
		categories: wcApi.fetchCategories(),
		taxClasses: wcApi.fetchTaxClasses(),
	};
}
*/

function mapStateToProps( state ) {
	const myState = state.extensions.calypsotron.productList;

	return { productListState: myState };
}

function mapDispatchToProps( dispatch ) {
	const {
		setDisplayOption,
		initEdits,
		addProduct,
		editProduct,
		cancelEdits,
		saveEdits,
	} = actions;

	return bindActionCreators(
		{
			setDisplayOption,
			initEdits,
			addProduct,
			editProduct,
			cancelEdits,
			saveEdits,
		},
		dispatch
	);
}

const localizedComponent = localize( ProductList );
export default connect( mapStateToProps, mapDispatchToProps )( localizedComponent );

// TODO: Restore redux state handling to this component.
//const fetchComponent = fetchConnect( mapFetchProps )( localizedComponent );
//export default connect( mapStateToProps, mapDispatchToProps )( fetchComponent );

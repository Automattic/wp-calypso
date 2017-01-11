/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import Button from 'components/button';

/**
 * Internal dependencies
 */
import TitleBar from '../../components/title-bar';
import ProductsBody from './body';

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
		products: PropTypes.object.isRequired,
		fetchProducts: PropTypes.func.isRequired,
		setDisplayOption: PropTypes.func.isRequired,
		initEdits: PropTypes.func.isRequired,
		addProduct: PropTypes.func.isRequired,
		editProduct: PropTypes.func.isRequired,
		cancelEdit: PropTypes.func.isRequired,
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

	componentDidMount() {
		// TODO: Fetch this through wc-api-redux
		// TODO: Restore redux state handling to this component.
		//this.props.fetchProducts( data.endpoints.products, data.nonce );
	}

	render() {
		const { products, categories, taxClasses, setDisplayOption, editProduct } = this.props;
		const { currencySymbol, currencyIsPrefix, currencyDecimals } = this.props;
		const { edits, saving } = products;

		return (
			<div className="product-list">
				<div className="product-list__header">
					{ edits ? this.renderEditTitle() : this.renderViewTitle() }
				</div>
				<ProductsBody
					products={ products.products }
					categories={ categories }
					taxClasses={ taxClasses }
					edits={ edits }
					editable={ edits != null }
					disabled={ Boolean( saving ) }
					display={ products.display }
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
				<Button onClick={ initEdits } >{ __( 'Edit products' ) }</Button>
				<Button primary onClick={ addProduct } >{ __( 'Add product' ) }</Button>
			</TitleBar>
		);
	}

	onCancelClick() {
		this.props.cancelEdits();
	}

	onSaveClick() {
		const { edits } = this.props.products;
		this.props.saveEdits( edits );
	}

	renderEditTitle() {
		const __ = this.props.translate;
		const { edits, saving } = this.props.products;

		return (
			<TitleBar icon="product" title={ __( 'Products' ) }>
				<Button onClick={ this.onCancelClick } >{ __( 'Cancel' ) }</Button>
				<Button
					primary
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

function mapStateToProps( state ) {
	const { products } = state;

	return {
		products,
	};
}

function mapDispatchToProps( dispatch ) {
	const {
		fetchProducts,
		setDisplayOption,
		initEdits,
		addProduct,
		editProduct,
		cancelEdits,
		saveEdits,
	} = actions;

	return bindActionCreators(
		{
			fetchProducts,
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
*/

export default localize( ProductList );

// TODO: Restore redux state handling to this component.
//const localizedComponent = localize( ProductList );
//const fetchComponent = fetchConnect( mapFetchProps )( localizedComponent );
//export default connect( mapStateToProps, mapDispatchToProps )( fetchComponent );


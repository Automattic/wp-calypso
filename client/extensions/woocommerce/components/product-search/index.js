/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { fetchProducts } from 'woocommerce/state/sites/products/actions';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import FormCheckbox from 'components/forms/form-checkbox';
import { getAllProducts } from 'woocommerce/state/sites/products/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import Search from 'components/search';

function productContainsString( product, textString ) {
	const matchString = textString.trim().toLocaleLowerCase();

	if ( -1 < product.name.toLocaleLowerCase().indexOf( matchString ) ) {
		// found in product name
		return true;
	}
	return false;
}

function isProductSelected( value = [], productId ) {
	if ( ! value.length ) {
		return false;
	}
	return -1 !== value.indexOf( productId );
}

function addProductId( value = [], productId ) {
	return [ ...value, productId ];
}

function removeProductId( value = [], productId ) {
	return value.filter( id => id !== productId );
}

function renderImage( imageSrc ) {
	const imageClasses = classNames( 'product-search__list-image', {
		'is-thumb-placeholder': ! imageSrc,
	} );

	return <span className={ imageClasses }>{ imageSrc && <img src={ imageSrc } /> }</span>;
}

function renderRow( component, rowText, rowValue, imageSrc, selected, onChange ) {
	const labelId = `applies-to-row-${ rowValue }-label`;

	const rowComponent = React.createElement( component, {
		htmlFor: labelId,
		name: 'applies_to_select',
		value: rowValue,
		checked: selected,
		onChange: onChange,
	} );

	return (
		<div className="product-search__row" key={ rowValue }>
			<FormLabel id={ labelId }>
				{ rowComponent }
				{ renderImage( imageSrc ) }
				<span>{ rowText }</span>
			</FormLabel>
		</div>
	);
}

class ProductSearch extends React.Component {
	static propTypes = {
		singular: PropTypes.bool,
		value: PropTypes.oneOfType( [ PropTypes.array, PropTypes.number ] ),
		onChange: PropTypes.func.isRequired,
		products: PropTypes.array,
	};

	constructor( props ) {
		super( props );
		this.state = {
			searchFilter: '',
		};
	}

	componentDidMount() {
		const { siteId } = this.props;

		if ( siteId ) {
			this.props.fetchProducts( siteId, { offset: 0, per_page: 50 } );
		}
	}

	componentWillReceiveProps( newProps ) {
		const { oldSiteId } = this.props;
		const { newSiteId } = newProps;

		if ( oldSiteId !== newSiteId ) {
			this.props.fetchProducts( newSiteId, { offset: 0, per_page: 50 } );
		}
	}

	getFilteredProducts() {
		const { value, products } = this.props;
		const { searchFilter } = this.state;

		if ( 0 === searchFilter.length ) {
			return products;
		}

		return (
			products &&
			products.filter( product => {
				return (
					productContainsString( product, searchFilter ) || isProductSelected( value, product.id )
				);
			} )
		);
	}

	renderSearch( searchFilter ) {
		return <Search value={ searchFilter } onSearch={ this.onSearch } />;
	}

	renderList( singular ) {
		const filteredProducts = this.getFilteredProducts() || [];
		const renderFunc = singular ? this.renderProductRadio : this.renderProductCheckbox;

		return <div className="product-search__list">{ filteredProducts.map( renderFunc ) }</div>;
	}

	renderProductCheckbox = product => {
		const { value } = this.props;
		const { name, id, images } = product;
		const selected = isProductSelected( value, id );
		const image = images && images[ 0 ];
		const imageSrc = image && image.src;

		return renderRow( FormCheckbox, name, id, imageSrc, selected, this.onProductCheckbox );
	};

	renderProductRadio = product => {
		const { value } = this.props;
		const { name, id, images } = product;
		const selected = isProductSelected( value, product.id );
		const image = images && images[ 0 ];
		const imageSrc = image && image.src;

		return renderRow( FormRadio, name, id, imageSrc, selected, this.onProductRadio );
	};

	onSearch = searchFilter => {
		this.setState( { searchFilter } );
	};

	onProductCheckbox = e => {
		const productId = Number( e.target.value );
		const { value } = this.props;
		const selected = isProductSelected( value, productId );
		const newValue = selected
			? removeProductId( value, productId )
			: addProductId( value, productId );
		this.props.onChange( newValue );
	};

	onProductRadio = event => {
		const productId = Number( event.target.value );
		this.props.onChange( productId );
	};

	render() {
		const { singular } = this.props;
		const { searchFilter } = this.state;

		return (
			<div className="product-search">
				{ this.renderSearch( searchFilter ) }
				{ this.renderList( singular ) }
			</div>
		);
	}
}

export default connect(
	state => {
		const site = getSelectedSiteWithFallback( state );
		const siteId = site ? site.ID : null;
		const products = getAllProducts( state, siteId );

		return {
			siteId,
			products,
		};
	},
	dispatch => bindActionCreators( { fetchProducts }, dispatch )
)( ProductSearch );

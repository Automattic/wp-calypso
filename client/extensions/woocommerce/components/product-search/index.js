/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	fetchProductSearchResults,
	clearProductSearch,
} from 'woocommerce/state/sites/products/actions';
import ProductSearchField from './search';
import ProductSearchResults from './results';

class ProductSearch extends Component {
	static propTypes = {
		clearProductSearch: PropTypes.func,
		fetchProductSearchResults: PropTypes.func,
		onSelect: PropTypes.func.isRequired,
		selected: PropTypes.array,
		translate: PropTypes.func,
	};

	state = {
		currentSearch: '',
		isActive: false,
		tokenInputHasFocus: false,
		tokens: [ 'Mug' ],
	};

	componentDidMount() {
		const { siteId } = this.props;
		this.props.fetchProductSearchResults( siteId, 1, '' );
	}

	componentWillReceiveProps( newProps ) {
		const { siteId } = newProps;
		if ( this.props.siteId !== siteId ) {
			this.props.fetchProductSearchResults( siteId, 1, '' );
		}
	}

	handleSearch = query => {
		this.setState( { currentSearch: query } );
		// @todo Debounce this
		const { siteId } = this.props;
		this.props.fetchProductSearchResults( siteId, 1, query );
	};

	onFocus = event => {
		this.setState( { isActive: true, tokenInputHasFocus: true } );
		if ( 'function' === typeof this.props.onFocus ) {
			this.props.onFocus( event );
		}
	};

	onBlur = () => {
		this.setState( { isActive: false, tokenInputHasFocus: false } );
	};

	addToken = token => {
		this.setState( prevState => ( {
			tokenInputHasFocus: prevState.isActive,
			currentSearch: '',
			tokens: [ ...prevState.tokens, token ],
		} ) );
	};

	updateTokens = tokens => {
		this.setState( { tokens } );
	};

	render() {
		const { currentSearch, tokens } = this.state;
		const classes = classNames( 'product-search', {
			'is-active': this.state.isActive,
			'is-disabled': this.props.disabled,
		} );

		return (
			<div className={ classes } onFocus={ this.onFocus } tabIndex="-1">
				<ProductSearchField
					ref="productSearch"
					currentSearch={ this.state.currentSearch }
					hasFocus={ this.state.tokenInputHasFocus }
					onChange={ this.updateTokens }
					onInputChange={ this.handleSearch }
					value={ tokens }
					onBlur={ this.onBlur }
				/>
				<ProductSearchResults search={ currentSearch } onSelect={ this.addToken } />
			</div>
		);
	}
}

export default connect( null, dispatch =>
	bindActionCreators(
		{
			fetchProductSearchResults,
			clearProductSearch,
		},
		dispatch
	)
)( localize( ProductSearch ) );

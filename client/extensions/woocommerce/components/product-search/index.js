/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { debounce, find, get } from 'lodash';

/**
 * Internal dependencies
 */
import {
	fetchProductSearchResults,
	clearProductSearch,
} from 'woocommerce/state/sites/products/actions';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import ProductSearchField from './search';
import ProductSearchResults from './results';

class ProductSearch extends Component {
	static propTypes = {
		clearProductSearch: PropTypes.func,
		disabled: PropTypes.bool,
		fetchProductSearchResults: PropTypes.func.isRequired,
		maxLength: PropTypes.number,
		onChange: PropTypes.func.isRequired,
		siteId: PropTypes.number.isRequired,
	};

	state = {
		currentSearch: '',
		isActive: false,
		tokenInputHasFocus: false,
		tokens: [],
	};

	componentDidMount() {
		this.debouncedSearch = debounce( this.fetchSearch, 500 );
	}

	componentWillUnmount() {
		const { siteId } = this.props;
		this.props.clearProductSearch( siteId );
	}

	handleSearch = query => {
		this.setState( { currentSearch: query } );
		this.debouncedSearch( query );
	};

	fetchSearch = query => {
		const { siteId } = this.props;
		this.props.fetchProductSearchResults( siteId, 1, query );
	};

	onFocus = () => {
		if ( this.state.tokens.length >= this.props.maxLength ) {
			return;
		}
		this.setState( { isActive: true, tokenInputHasFocus: true } );
	};

	onBlur = () => {
		this.setState( { isActive: false, tokenInputHasFocus: false } );
	};

	hasToken = token => {
		const match = { id: token.id };
		if ( token.variation ) {
			match.variation = token.variation;
		}
		return !! find( this.state.tokens, match );
	};

	addToken = token => {
		if ( this.hasToken( token ) ) {
			return;
		}
		this.setState(
			prevState => {
				const tokens = [ ...prevState.tokens, token ];
				let isActive = true;
				if ( tokens.length >= this.props.maxLength ) {
					isActive = false;
				}
				return {
					currentSearch: '',
					isActive,
					tokenInputHasFocus: isActive,
					tokens,
				};
			},
			() => this.props.onChange( this.state.tokens )
		);
	};

	updateTokens = tokens => {
		this.setState( { tokens }, () => this.props.onChange( this.state.tokens ) );
	};

	render() {
		const { currentSearch, tokens } = this.state;
		const classes = classNames( {
			'product-search': true,
			'token-field': true,
			'is-active': this.state.isActive,
			'is-disabled': this.props.disabled,
		} );

		return (
			<div className={ classes }>
				<ProductSearchField
					currentSearch={ this.state.currentSearch }
					disabled={ this.props.disabled }
					hasFocus={ this.state.tokenInputHasFocus }
					maxLength={ this.props.maxLength }
					onBlur={ this.onBlur }
					onChange={ this.updateTokens }
					onFocus={ this.onFocus }
					onInputChange={ this.handleSearch }
					placeholder={ this.props.placeholder }
					value={ tokens }
				/>
				<ProductSearchResults
					isSelected={ this.hasToken }
					onSelect={ this.addToken }
					search={ currentSearch }
				/>
			</div>
		);
	}
}

export default connect(
	state => ( {
		siteId: get( getSelectedSiteWithFallback( state ), 'ID' ),
	} ),
	dispatch =>
		bindActionCreators(
			{
				fetchProductSearchResults,
				clearProductSearch,
			},
			dispatch
		)
)( ProductSearch );

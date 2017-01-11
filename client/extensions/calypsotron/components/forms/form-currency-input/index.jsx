/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import omit from 'lodash.omit';

/**
 * Internal dependencies
 */
import FormNumberInputWithAffixes from '../form-number-input-with-affixes';

export default class FormCurrencyInput extends React.Component {
	static propTypes = {
		currencySymbol: PropTypes.string.required,
		currencySymbolIsPrefix: PropTypes.string.required,
	}

	render() {
		const { currencySymbol, currencySymbolIsPrefix } = this.props;
		const passThruProps = omit( this.props, [ 'currencySymbol', 'currencySymbolIsPrefix' ] );

		if ( currencySymbolIsPrefix ) {
			passThruProps.prefix = currencySymbol;
		} else {
			passThruProps.suffix = currencySymbol;
		}

		passThruProps.className = classNames(
			passThruProps.className,
			'form-currency-input'
		);

		return (
			<FormNumberInputWithAffixes { ...passThruProps } />
		);
	}
}


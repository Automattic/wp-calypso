/**
 * External dependencies
 */
import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { isEmpty, omit } from 'lodash';

/**
 * Style dependencies
 */
import './style.scss';

/* eslint-disable jsx-a11y/no-onchange */
export class FormCountrySelect extends Component {
	static propTypes = {
		countriesList: PropTypes.array.isRequired,
		className: PropTypes.string,
		disabled: PropTypes.bool,
		onChange: PropTypes.func,
	};

	getOptions() {
		const { countriesList } = this.props;

		if ( isEmpty( countriesList ) ) {
			return [
				{
					key: '',
					label: 'Loading…',
				},
			];
		}

		return countriesList.map( ( { code, name }, idx ) => ( {
			key: idx,
			label: name,
			code,
			disabled: ! code,
		} ) );
	}

	render() {
		const options = this.getOptions();

		return (
			<select
				{ ...omit( this.props, [ 'className', 'countriesList', 'moment', 'numberFormat' ] ) }
				className={ classnames( this.props.className, 'form-country-select' ) }
				onChange={ this.props.onChange }
				disabled={ this.props.disabled }
			>
				{ options.map( function( option ) {
					return (
						<option key={ option.key } value={ option.code } disabled={ option.disabled }>
							{ option.label }
						</option>
					);
				} ) }
			</select>
		);
	}
}
/* eslint-enable jsx-a11y/no-onchange */

export default FormCountrySelect;

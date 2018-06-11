/** @format */

/**
 * External dependencies
 */

import React from 'react';
import createReactClass from 'create-react-class';
import classnames from 'classnames';
import { isEmpty, omit } from 'lodash';
import { localize } from 'i18n-calypso';

/* mixins need to be refactored out eventually */
/* eslint-disable react/prefer-es6-class */
/* eslint-disable jsx-a11y/no-onchange */
export const FormCountrySelect = createReactClass( {
	displayName: 'FormCountrySelect',

	getOptions( countriesList ) {
		if ( isEmpty( countriesList ) ) {
			return [
				{
					key: '',
					label: this.props.translate( 'Loading…' ),
				},
			];
		}
		return countriesList.map( ( { code, name }, idx ) => ( {
			key: idx,
			label: name,
			code,
			disabled: ! code,
		} ) );
	},

	render() {
		const countriesList = this.props.countriesList,
			options = this.getOptions( countriesList );

		return (
			<select
				{ ...omit( this.props, [
					'className',
					'countriesList',
					'translate',
					'moment',
					'numberFormat',
				] ) }
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
	},
} );
/* eslint-enable jsx-a11y/no-onchange */
/* eslint-enable react/prefer-es6-class */

export default localize( FormCountrySelect );

/** @format */

/**
 * External dependencies
 */

import React from 'react';
import createReactClass from 'create-react-class';
import classnames from 'classnames';
import observe from 'lib/mixins/data-observe';
import { isEmpty, omit } from 'lodash';
import { localize } from 'i18n-calypso';

export default localize(
	createReactClass( {
		displayName: 'FormCountrySelect',

		mixins: [ observe( 'countriesList' ) ],

		getOptions( countriesList ) {
			if ( isEmpty( countriesList ) ) {
				return [
					{
						key: '',
						label: this.props.translate( 'Loading…' ),
						disabled: true,
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
			const countriesList = this.props.countriesList.get(),
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
	} )
);

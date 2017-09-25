/**
 * External dependencies
 */
import classnames from 'classnames';
import createReactClass from 'create-react-class';
import { localize } from 'i18n-calypso';
import { isEmpty, omit } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import observe from 'lib/mixins/data-observe';

export default localize(
	createReactClass( {
		displayName: 'FormCountrySelect',

		mixins: [ observe( 'countriesList' ) ],

		getOptions( countriesList ) {
			if ( isEmpty( countriesList ) ) {
				return [ {
					key: '',
					label: this.props.translate( 'Loading…' ),
					disabled: true,
				} ];
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

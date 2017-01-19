/**
 * External dependencies
 */
import React from 'react';
import isEmpty from 'lodash/isEmpty';
import classnames from 'classnames';
import observe from 'lib/mixins/data-observe';
import omit from 'lodash/omit';
import { localize } from 'i18n-calypso';

export default localize( React.createClass( {

	displayName: 'FormCountrySelect',

	mixins: [ observe( 'countriesList' ) ],

	getOptions( countriesList ) {
		if ( isEmpty( countriesList ) ) {
			return [ { key: '', label: this.props.translate( 'Loading…' ), disabled: 'disabled' } ];
		}
		return countriesList.map( ( { code, name }, idx ) => (
			{
				key: idx,
				label: name,
				code,
				disabled: code ? '' : 'disabled'
			}
		) );
	},

	render() {
		const countriesList = this.props.countriesList.get(),
			options = this.getOptions( countriesList );

		return (
			<select
				{ ...omit( this.props, 'className' ) }
				className={ classnames( this.props.className, 'form-country-select' ) }
				onChange={ this.props.onChange }
			>
				{ options.map( function( option ) {
					return <option key={ option.key } value={ option.code } disabled={ option.disabled }>{ option.label }</option>;
				} ) }
			</select>
		);
	}
} ) );

/**
 * External dependencies
 */
import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { isEmpty, omit } from 'lodash';
import { localize } from 'i18n-calypso';

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
		translate: PropTypes.func.isRequired,
		ariaLabelledBy: PropTypes.string,
		ariaDescribedBy: PropTypes.string,
		initialValue: PropTypes.string,
	};

	constructor( props ) {
		super( props );
		this.state = {
			currentValue: props.initialValue,
		};
	}

	getOptions() {
		const { countriesList, translate } = this.props;

		if ( isEmpty( countriesList ) ) {
			return [
				{
					key: '',
					label: translate( 'Loading…' ),
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
				{ ...omit( this.props, [
					'className',
					'countriesList',
					'translate',
					'moment',
					'numberFormat',
				] ) }
				className={ classnames( this.props.className, 'form-country-select' ) }
				onChange={ event => {
					this.setState( { currentValue: event.target.value } );
					this.props.onChange( event );
				} }
				disabled={ this.props.disabled }
				aria-labelledby={ this.props.ariaLabelledBy }
				aria-describedby={ this.props.ariaDescribedBy }
				value={ this.state.currentValue }
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

export default localize( FormCountrySelect );

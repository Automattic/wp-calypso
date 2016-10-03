/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import { localize } from 'i18n-calypso';
import ReactDom from 'react-dom';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import FormInputValidation from 'components/forms/form-input-validation';
import { getCountryStates } from 'state/country-states/selectors';
import Input from './input';
import QueryCountryStates from 'components/data/query-country-states';
import scrollIntoViewport from 'lib/scroll-into-viewport';

class StateSelect extends Component {

	recordStateSelectClick() {
		if ( this.props.eventFormName ) {
			analytics.ga.recordEvent( 'Upgrades', `Clicked ${ this.props.eventFormName } State Select` );
		}
	}

	focus() {
		const node = ReactDom.findDOMNode( this.refs.input );
		if ( node ) {
			node.focus();
			scrollIntoViewport( node );
		} else {
			this.refs.state.focus();
		}
	}

	query() {
		return this.props.countryCode && <QueryCountryStates countryCode={ this.props.countryCode } />;
	}

	render() {
		const classes = classNames( this.props.additionalClasses, 'state' );

		this.query();

		if ( isEmpty( this.props.countryStates ) ) {
			return (
				<Input ref="state" { ...this.props } />
			);
		}

		this.props.countryStates.push( { code: '', name: this.translate( 'Select State' ) } );

		return (
			<div className={ classes }>
				<div>
					<FormLabel htmlFor={ this.props.name }>{ this.props.label }</FormLabel>
					<FormSelect
						ref="input"
						name={ this.props.name }
						value={ this.props.value }
						disabled={ this.props.disabled }
						onChange={ this.props.onChange }
						onClick={ this.recordStateSelectClick }
						isError={ this.props.isError } >
						{ this.props.countryStates.map( ( state ) => {
							let disabled;

							if ( ! state.code ) {
								state.code = '--';
								disabled = 'disabled';
							}

							return <option key={ state.code } value={ state.code } disabled={ disabled }>{ state.name }</option>;
						} ) }
					</FormSelect>
				</div>
				{ this.props.errorMessage && <FormInputValidation text={ this.props.errorMessage } isError /> }
			</div>
		);
	}
}

StateSelect.propTypes = {
	additionalClasses: PropTypes.string,
	countryCode: PropTypes.string,
	countryStates: PropTypes.array,
	diabled: PropTypes.bool,
	errorMessage: PropTypes.string,
	eventFormName: PropTypes.string,
	isError: PropTypes.bool,
	label: PropTypes.string,
	name: PropTypes.string,
	onChange: PropTypes.func,
	value: PropTypes.string,
};

module.exports = connect(
	( state, { countryCode } ) => ( {
		countryStates: countryCode ? getCountryStates( state, countryCode ) : []
	} )
)( localize( StateSelect ) );

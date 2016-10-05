/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { localize } from 'i18n-calypso';
import ReactDom from 'react-dom';

/**
 * Internal dependencies
 */
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import FormInputValidation from 'components/forms/form-input-validation';
import { getCountryStates } from 'state/country-states/selectors';
import Input from './input';
import QueryCountryStates from 'components/data/query-country-states';
import { recordGoogleEvent } from 'state/analytics/actions';
import scrollIntoViewport from 'lib/scroll-into-viewport';

class StateSelect extends Component {

	recordStateSelectClick( eventFormName ) {
		if ( eventFormName ) {
			recordGoogleEvent( 'Upgrades', `Clicked ${ eventFormName } State Select` );
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

	render() {
		const classes = classNames( this.props.additionalClasses, 'state' );

		return (
			<div>
				{ this.props.countryCode && <QueryCountryStates countryCode={ this.props.countryCode } /> }
				{ isEmpty( this.props.countryStates )
					? <Input ref="input" { ...this.props } />
					: <div className={ classes }>
						<FormLabel htmlFor={ this.props.name }>{ this.props.label }</FormLabel>
						<FormSelect
							ref="input"
							name={ this.props.name }
							value={ this.props.value }
							disabled={ this.props.disabled }
							onChange={ this.props.onChange }
							onClick={ this.recordStateSelectClick.bind( this, this.props.eventFormName ) }
							isError={ this.props.isError } >

							<option key="--" value="--" disabled="disabled">{ this.props.translate( 'Select State' ) }</option>
							{ this.props.countryStates.map( ( state ) =>
								<option key={ state.code } value={ state.code }>{ state.name }</option>
							) }
						</FormSelect>
					</div>
				}
				{ this.props.errorMessage && <FormInputValidation text={ this.props.errorMessage } isError /> }
			</div>
		);
	}
}

StateSelect.propTypes = {
	additionalClasses: PropTypes.string,
	countryCode: PropTypes.string,
	countryStates: PropTypes.array,
	disabled: PropTypes.bool,
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

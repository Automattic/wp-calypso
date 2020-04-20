/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import FormInputValidation from 'components/forms/form-input-validation';
import { getCountryStates } from 'state/country-states/selectors';
import QueryCountryStates from 'components/data/query-country-states';
import { recordGoogleEvent } from 'state/analytics/actions';
import scrollIntoViewport from 'lib/scroll-into-viewport';
import Input from './input';

class StateSelect extends Component {
	static instances = 0;

	inputRef = ( element ) => {
		this.inputElement = element;

		if ( ! this.props.inputRef ) {
			return;
		}

		if ( typeof inputRef === 'function' ) {
			this.props.inputRef( element );
		} else {
			this.props.inputRef.current = element;
		}
	};

	UNSAFE_componentWillMount() {
		this.instance = ++this.constructor.instances;
	}

	recordStateSelectClick = () => {
		const { eventFormName, recordGoogleEvent: recordEvent } = this.props;

		if ( eventFormName ) {
			recordEvent( 'Upgrades', `Clicked ${ eventFormName } State Select` );
		}
	};

	focus() {
		const node = this.inputElement;
		if ( node ) {
			node.focus();
			scrollIntoViewport( node, {
				behavior: 'smooth',
				scrollMode: 'if-needed',
			} );
		}
	}

	render() {
		const classes = classNames( this.props.additionalClasses, 'state' );
		const {
			countryCode,
			countryStates,
			errorMessage,
			name,
			value,
			disabled,
			onBlur,
			onChange,
			isError,
			selectText,
		} = this.props;
		const validationId = `validation-field-${ this.props.name }`;

		return (
			<div>
				{ countryCode && <QueryCountryStates countryCode={ countryCode } /> }
				{ isEmpty( countryStates ) ? (
					<Input inputRef={ this.inputRef } { ...this.props } />
				) : (
					<div className={ classes }>
						<FormLabel htmlFor={ `${ this.constructor.name }-${ this.instance }` }>
							{ this.props.label }
						</FormLabel>
						<FormSelect
							aria-invalid={ isError }
							aria-describedby={ validationId }
							id={ `${ this.constructor.name }-${ this.instance }` }
							name={ name }
							value={ value }
							disabled={ disabled }
							onBlur={ onBlur }
							onChange={ onChange }
							onClick={ this.recordStateSelectClick }
							isError={ isError }
							inputRef={ this.inputRef }
						>
							<option key="--" value="" disabled="disabled">
								{ selectText || this.props.translate( 'Select State' ) }
							</option>
							{ countryStates.map( ( state ) => (
								<option key={ state.code } value={ state.code }>
									{ state.name }
								</option>
							) ) }
						</FormSelect>
						{ errorMessage && (
							<FormInputValidation id={ validationId } text={ errorMessage } isError />
						) }
					</div>
				) }
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
	selectText: PropTypes.string,
	inputRef: PropTypes.func,
};

export default connect(
	( state, { countryCode } ) => ( {
		countryStates: countryCode ? getCountryStates( state, countryCode ) : [],
	} ),
	{ recordGoogleEvent }
)( localize( StateSelect ) );

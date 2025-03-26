import { FormInputValidation, FormLabel } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import QueryCountryStates from 'calypso/components/data/query-country-states';
import FormSelect from 'calypso/components/forms/form-select';
import scrollIntoViewport from 'calypso/lib/scroll-into-viewport';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { getCountryStates } from 'calypso/state/country-states/selectors';
import Input from './input';

class StateSelect extends PureComponent {
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
		const classes = clsx( this.props.additionalClasses, 'state' );
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
		const fieldId = crypto.randomUUID();

		return (
			<>
				{ countryCode && <QueryCountryStates countryCode={ countryCode } /> }
				{ isEmpty( countryStates ) ? (
					<Input inputRef={ this.inputRef } { ...this.props } />
				) : (
					<div className={ classes }>
						<FormLabel htmlFor={ `${ this.constructor.name }-${ fieldId }` }>
							{ this.props.label }
						</FormLabel>
						<FormSelect
							aria-invalid={ isError }
							aria-describedby={ validationId }
							id={ `${ this.constructor.name }-${ fieldId }` }
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
			</>
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

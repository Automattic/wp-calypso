/**
 * External dependencies
 */
import {
	assign,
	camelCase,
	constant,
	debounce,
	every,
	filter,
	flatten,
	isEmpty,
	isUndefined,
	map,
	mapValues,
	pickBy,
	property,
	some,
	uniqueId,
} from 'lodash';
import update from 'immutability-helper';

function Controller( options ) {
	let debounceWait;

	if ( ! ( this instanceof Controller ) ) {
		return new Controller( options );
	}

	if ( options.initialState ) {
		this._initialState = options.initialState;
	} else if ( options.initialFields ) {
		this._initialState = createInitialFormState( options.initialFields );
	} else {
		this._initialState = createInitialFormState( createNullFieldValues( options.fieldNames ) );
	}

	this._currentState = this._initialState;

	this._sanitizerFunction = options.sanitizerFunction;
	this._validatorFunction = options.validatorFunction;
	this._skipSanitizeAndValidateOnFieldChange = options.skipSanitizeAndValidateOnFieldChange;
	this._loadFunction = options.loadFunction;
	this._onNewState = options.onNewState;
	this._onError = options.onError;

	this._pendingValidation = null;
	this._onValidationComplete = null;

	debounceWait = isUndefined( options.debounceWait ) ? 1000 : options.debounceWait;
	this._debouncedSanitize = debounce( this.sanitize, debounceWait );
	this._debouncedValidate = debounce( this.validate, debounceWait );

	this._hideFieldErrorsOnChange = isUndefined( options.hideFieldErrorsOnChange )
		? false
		: options.hideFieldErrorsOnChange;

	if ( this._loadFunction ) {
		this._loadFieldValues();
	}
}

assign( Controller.prototype, {
	getInitialState: function () {
		return this._initialState;
	},

	_loadFieldValues: function () {
		this._loadFunction(
			function ( error, fieldValues ) {
				if ( error ) {
					this._onError( error );
					return;
				}

				this._setState( initializeFields( this._currentState, fieldValues ) );
			}.bind( this )
		);
	},

	handleFieldChange: function ( change ) {
		let formState = this._currentState,
			name = camelCase( change.name ),
			value = change.value,
			hideError = this._hideFieldErrorsOnChange || change.hideError;

		this._setState( changeFieldValue( formState, name, value, hideError ) );

		// If we want to handle sanitize/validate differently in the component (e.g. onBlur)
		// FormState handleSubmit() will sanitize/validate if not done yet
		if ( ! this._skipSanitizeAndValidateOnFieldChange ) {
			this._debouncedSanitize();
			this._debouncedValidate();
		}
	},

	handleSubmit: function ( onComplete ) {
		const isAlreadyValid =
			! this._pendingValidation &&
			! needsValidation( this._currentState ) &&
			isEveryFieldInitialized( this._currentState );

		if ( isAlreadyValid ) {
			onComplete( hasErrors( this._currentState ) );
			return;
		}

		this._onValidationComplete = function () {
			this._setState( showAllErrors( this._currentState ) );
			onComplete( hasErrors( this._currentState ) );
		}.bind( this );

		if ( ! this._pendingValidation ) {
			this.sanitize();
			this.validate();
		}
	},

	_setState: function ( newState ) {
		this._currentState = newState;
		this._onNewState( newState );
	},

	sanitize: function () {
		const fieldValues = getAllFieldValues( this._currentState );

		if ( ! this._sanitizerFunction ) {
			return;
		}

		this._sanitizerFunction(
			fieldValues,
			function ( newFieldValues ) {
				this._setState( changeFieldValues( this._currentState, newFieldValues ) );
			}.bind( this )
		);
	},

	validate: function () {
		let fieldValues = getAllFieldValues( this._currentState ),
			id = uniqueId();

		this._setState( setFieldsValidating( this._currentState ) );

		this._pendingValidation = id;

		this._validatorFunction(
			fieldValues,
			function ( error, fieldErrors ) {
				if ( id !== this._pendingValidation ) {
					return;
				}

				if ( error ) {
					this._onError( error );
					return;
				}

				this._pendingValidation = null;
				this._setState(
					setFieldErrors( this._currentState, fieldErrors, this._hideFieldErrorsOnChange )
				);

				if ( this._onValidationComplete ) {
					this._onValidationComplete();
					this._onValidationComplete = null;
				}
			}.bind( this )
		);
	},

	resetFields: function ( fieldValues ) {
		this._initialState = createInitialFormState( fieldValues );
		this._setState( this._initialState );
	},
} );

function changeFieldValue( formState, name, value, hideFieldErrorsOnChange ) {
	let fieldState = getField( formState, name ),
		command = {},
		errors;

	// We reset the errors if we weren't showing them already to avoid a flash of
	// error messages when the user starts typing.
	errors = fieldState.isShowingErrors ? fieldState.errors : [];

	command[ name ] = {
		$merge: {
			value: value,
			errors: errors,
			isShowingErrors: ! hideFieldErrorsOnChange,
			isPendingValidation: true,
			isValidating: false,
		},
	};

	return update( formState, command );
}

function changeFieldValues( formState, fieldValues ) {
	return updateFields( formState, function ( name ) {
		return { value: fieldValues[ name ] };
	} );
}

function updateFields( formState, callback ) {
	return mapValues( formState, function ( field, name ) {
		return assign( {}, field, callback( name ) );
	} );
}

function initializeFields( formState, fieldValues ) {
	return updateFields( formState, function ( name ) {
		return { value: fieldValues[ name ] || '', name };
	} );
}

function setFieldsValidating( formState ) {
	return assign(
		{},
		formState,
		updateFields( formState, function () {
			return { isValidating: true };
		} )
	);
}

function setFieldErrors( formState, fieldErrors, hideFieldErrorsOnChange ) {
	return assign(
		{},
		formState,
		updateFields( getFieldsValidating( formState ), function ( name ) {
			const newFields = {
				errors: fieldErrors[ name ] || [],
				isPendingValidation: false,
				isValidating: false,
			};

			if ( hideFieldErrorsOnChange ) {
				newFields.isShowingErrors = Boolean( fieldErrors[ name ] );
			}

			return newFields;
		} )
	);
}

function showAllErrors( formState ) {
	return updateFields(
		initializeFields( formState, getAllFieldValues( formState ) ),
		constant( {
			isShowingErrors: true,
		} )
	);
}

function hasErrors( formState ) {
	return ! isEmpty( getErrorMessages( formState ) );
}

function needsValidation( formState ) {
	return some( formState, function ( field ) {
		return field.errors === null || ! field.isShowingErrors || field.isPendingValidation;
	} );
}

function createNullFieldValues( fieldNames ) {
	return fieldNames.reduce( function ( fields, name ) {
		fields[ name ] = null;
		return fields;
	}, {} );
}

function createInitialFormState( fieldValues ) {
	return mapValues( fieldValues, function ( value ) {
		return {
			value: value,
			errors: null,
			isShowingErrors: false,
			isPendingValidation: false,
			isValidating: false,
		};
	} );
}

function getField( formState, fieldName ) {
	return formState[ camelCase( fieldName ) ];
}

function getFieldValue( formState, fieldName ) {
	return getField( formState, fieldName ).value;
}

function getAllFieldValues( formState ) {
	return mapValues( formState, 'value' );
}

function getFieldErrorMessages( formState, fieldName ) {
	if ( ! isFieldInvalid( formState, fieldName ) ) {
		return;
	}
	return getField( formState, fieldName ).errors;
}

function getFieldsValidating( formState ) {
	return pickBy( formState, property( 'isValidating' ) );
}

function isInitialized( field ) {
	return field.value !== null;
}

function isEveryFieldInitialized( formState ) {
	return every( formState, isInitialized );
}

function isFieldInvalid( formState, fieldName ) {
	const field = getField( formState, fieldName );

	return isInitialized( field ) && field.isShowingErrors && ! isEmpty( field.errors );
}

function isFieldPendingValidation( formState, fieldName ) {
	const field = getField( formState, fieldName );

	return field.isPendingValidation;
}

function isFieldValidating( formState, fieldName ) {
	const field = getField( formState, fieldName );

	return field.isValidating;
}

function getInvalidFields( formState ) {
	return filter( formState, function ( field, fieldName ) {
		return isFieldInvalid( formState, fieldName );
	} );
}
function getErrorMessages( formState ) {
	const invalidFields = getInvalidFields( formState );

	return flatten( map( invalidFields, 'errors' ) );
}

function isSubmitButtonDisabled( formState ) {
	return ! every( formState, isInitialized );
}

function isFieldDisabled( formState, fieldName ) {
	const field = getField( formState, fieldName );
	return ! isInitialized( field );
}

function isFieldValid( formState, fieldName ) {
	return (
		! isFieldInvalid( formState, fieldName ) &&
		! isEmpty( getFieldValue( formState, fieldName ) ) &&
		! isFieldPendingValidation( formState, fieldName )
	);
}

function isFieldPossiblyValid( formState, fieldName ) {
	return (
		! isEmpty( getFieldValue( formState, fieldName ) ) &&
		( ! isFieldInvalid( formState, fieldName ) || isFieldPendingValidation( formState, fieldName ) )
	);
}

function showFieldValidationLoading( formState, fieldName ) {
	return (
		isFieldValidating( formState, fieldName ) &&
		getFieldValue( formState, fieldName ) &&
		! isFieldValid( formState, fieldName )
	);
}

export default {
	Controller: Controller,
	getFieldValue: getFieldValue,
	setFieldsValidating: setFieldsValidating,
	setFieldErrors: setFieldErrors,
	getErrorMessages: getErrorMessages,
	getInvalidFields: getInvalidFields,
	getFieldErrorMessages: getFieldErrorMessages,
	hasErrors: hasErrors,
	isFieldDisabled: isFieldDisabled,
	isFieldInvalid: isFieldInvalid,
	isFieldPendingValidation: isFieldPendingValidation,
	isFieldValidating: isFieldValidating,
	getAllFieldValues: getAllFieldValues,
	isSubmitButtonDisabled: isSubmitButtonDisabled,
	isFieldValid: isFieldValid,
	isFieldPossiblyValid: isFieldPossiblyValid,
	showFieldValidationLoading: showFieldValidationLoading,
	createInitialFormState: createInitialFormState,
	createNullFieldValues: createNullFieldValues,
	initializeFields: initializeFields,
	changeFieldValue: changeFieldValue,
};

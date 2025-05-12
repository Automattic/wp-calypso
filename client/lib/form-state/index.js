import update from 'immutability-helper';
import {
	camelCase,
	debounce,
	filter,
	flatten,
	isEmpty,
	map,
	mapValues,
	pickBy,
	property,
	some,
} from 'lodash';

function Controller( options ) {
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

	const debounceWait = typeof options.debounceWait === 'undefined' ? 1000 : options.debounceWait;
	this._debouncedSanitize = debounce( this.sanitize, debounceWait );
	this._debouncedValidate = debounce( this.validate, debounceWait );

	this._hideFieldErrorsOnChange =
		typeof options.hideFieldErrorsOnChange === 'undefined'
			? false
			: options.hideFieldErrorsOnChange;

	if ( this._loadFunction ) {
		this._loadFieldValues();
	}
}

Controller.prototype.getInitialState = function () {
	return this._initialState;
};

Controller.prototype._loadFieldValues = function () {
	this._loadFunction( ( error, fieldValues ) => {
		if ( error ) {
			this._onError( error );
			return;
		}

		this._setState( initializeFields( this._currentState, fieldValues ) );
	} );
};

Controller.prototype.handleFieldChange = function ( change ) {
	const formState = this._currentState;
	const name = camelCase( change.name );
	const value = change.value;
	const hideError = this._hideFieldErrorsOnChange || change.hideError;

	this._setState( changeFieldValue( formState, name, value, hideError ) );

	// If we want to handle sanitize/validate differently in the component (e.g. onBlur)
	// FormState handleSubmit() will sanitize/validate if not done yet
	if ( ! this._skipSanitizeAndValidateOnFieldChange ) {
		this._debouncedSanitize();
		this._debouncedValidate();
	}
};

Controller.prototype.handleSubmit = function ( onComplete ) {
	const isAlreadyValid =
		! this._pendingValidation &&
		! needsValidation( this._currentState ) &&
		isEveryFieldInitialized( this._currentState );

	if ( isAlreadyValid ) {
		onComplete( hasErrors( this._currentState ) );
		return;
	}

	this._onValidationComplete = () => {
		this._setState( showAllErrors( this._currentState ) );
		onComplete( hasErrors( this._currentState ) );
	};

	if ( ! this._pendingValidation ) {
		this.sanitize();
		this.validate();
	}
};

Controller.prototype._setState = function ( newState ) {
	this._currentState = newState;
	this._onNewState( newState );
};

Controller.prototype.sanitize = function () {
	const fieldValues = getAllFieldValues( this._currentState );

	if ( ! this._sanitizerFunction ) {
		return;
	}

	this._sanitizerFunction( fieldValues, ( newFieldValues ) => {
		this._setState( changeFieldValues( this._currentState, newFieldValues ) );
	} );
};

Controller.prototype.validate = function () {
	const fieldValues = getAllFieldValues( this._currentState );
	const id = crypto.randomUUID();

	this._setState( setFieldsValidating( this._currentState ) );

	this._pendingValidation = id;

	this._validatorFunction( fieldValues, ( error, fieldErrors ) => {
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
	} );
};

Controller.prototype.resetFields = function ( fieldValues ) {
	this._initialState = createInitialFormState( fieldValues );
	this._setState( this._initialState );
};

function changeFieldValue( formState, name, value, hideFieldErrorsOnChange ) {
	const fieldState = getField( formState, name );
	const command = {};

	// We reset the errors if we weren't showing them already to avoid a flash of
	// error messages when the user starts typing.
	const errors = fieldState.isShowingErrors ? fieldState.errors : [];

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
		return { ...field, ...callback( name ) };
	} );
}

function initializeFields( formState, fieldValues ) {
	return updateFields( formState, function ( name ) {
		return { value: fieldValues[ name ] || '', name };
	} );
}

function setFieldsValidating( formState ) {
	return {
		...formState,
		...updateFields( formState, function () {
			return { isValidating: true };
		} ),
	};
}

function setFieldErrors( formState, fieldErrors, hideFieldErrorsOnChange ) {
	return {
		...formState,
		...updateFields( getFieldsValidating( formState ), function ( name ) {
			const newFields = {
				errors: fieldErrors[ name ] || [],
				isPendingValidation: false,
				isValidating: false,
			};

			if ( hideFieldErrorsOnChange ) {
				newFields.isShowingErrors = Boolean( fieldErrors[ name ] );
			}

			return newFields;
		} ),
	};
}

function showAllErrors( formState ) {
	return updateFields( initializeFields( formState, getAllFieldValues( formState ) ), () => ( {
		isShowingErrors: true,
	} ) );
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
	return formState[ camelCase( fieldName ) ] ?? {};
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
	return Object.values( formState ).every( isInitialized );
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
	return ! Object.values( formState ).every( isInitialized );
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

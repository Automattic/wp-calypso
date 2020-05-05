/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import FormLabel from 'components/forms/form-label';
import FormInputValidation from 'components/forms/form-input-validation';
import FormSelect from 'components/forms/form-select';
import { gaRecordEvent } from 'lib/analytics/ga';

export default class Select extends PureComponent {
	static propTypes = {
		label: PropTypes.string.isRequired,
		name: PropTypes.string.isRequired,
		onChange: PropTypes.func.isRequired,
		options: PropTypes.array.isRequired,
		value: PropTypes.string.isRequired,
		additionalClasses: PropTypes.string,
		errorMessage: PropTypes.string,
		disabled: PropTypes.bool,
	};

	static defaultProps = {
		additionalClasses: '',
		errorMessage: '',
		disabled: false,
	};

	recordFieldClick = () => {
		if ( this.props.eventFormName ) {
			gaRecordEvent( 'Upgrades', `Clicked ${ this.props.eventFormName } Field`, this.props.name );
		}
	};

	render() {
		const classes = classNames( this.props.additionalClasses, this.props.name );

		const validationId = `validation-field-${ this.props.name }`;

		return (
			<div className={ classes }>
				<FormLabel htmlFor={ this.props.name }>{ this.props.label }</FormLabel>
				<FormSelect
					aria-invalid={ this.props.isError }
					aria-describedby={ validationId }
					name={ this.props.name }
					id={ this.props.name }
					value={ this.props.value }
					disabled={ this.props.disabled }
					inputRef={ this.props.inputRef }
					onChange={ this.props.onChange }
					onClick={ this.recordFieldClick }
					isError={ this.props.isError }
				>
					{ this.props.options.map( ( option ) => (
						<option key={ option.value } value={ option.value } disabled={ option.disabled }>
							{ option.label }
						</option>
					) ) }
				</FormSelect>
				{ this.props.errorMessage && (
					<FormInputValidation id={ validationId } text={ this.props.errorMessage } isError />
				) }
			</div>
		);
	}
}

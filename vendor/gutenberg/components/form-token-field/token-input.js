/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';

class TokenInput extends Component {
	constructor() {
		super( ...arguments );
		this.onChange = this.onChange.bind( this );
		this.bindInput = this.bindInput.bind( this );
	}

	focus() {
		this.input.focus();
	}

	hasFocus() {
		return this.input === document.activeElement;
	}

	bindInput( ref ) {
		this.input = ref;
	}

	onChange( event ) {
		this.props.onChange( {
			value: event.target.value,
		} );
	}

	render() {
		const { value, placeholder, isExpanded, instanceId, selectedSuggestionIndex, ...props } = this.props;
		const size = ( ( value.length === 0 && placeholder && placeholder.length ) || value.length ) + 1;

		return (
			<input
				ref={ this.bindInput }
				id={ `components-form-token-input-${ instanceId }` }
				type="text"
				{ ...props }
				value={ value }
				placeholder={ placeholder }
				onChange={ this.onChange }
				size={ size }
				className="components-form-token-field__input"
				role="combobox"
				aria-expanded={ isExpanded }
				aria-autocomplete="list"
				aria-owns={ isExpanded ? `components-form-token-suggestions-${ instanceId }` : undefined }
				aria-activedescendant={ selectedSuggestionIndex !== -1 ? `components-form-token-suggestions-${ instanceId }-${ selectedSuggestionIndex }` : undefined }
				aria-describedby={ `components-form-token-suggestions-howto-${ instanceId }` }
			/>
		);
	}
}

export default TokenInput;

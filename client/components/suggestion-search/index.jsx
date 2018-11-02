/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormTextInput from 'components/forms/form-text-input';
import Suggestions from 'components/suggestions';

class SuggestionSearch extends Component {
	static propTypes = {
		translate: PropTypes.func.isRequired,
	};

	constructor( props ) {
		super( props );

		this.state = {
			query: '',
			inputValue: '',
		};
	}

	setSuggestionsRef = ref => {
		this.suggestionsRef = ref;
	};

	hideSuggestions = () => {
		this.setState( { query: '' } );
	};

	handleSuggestionChangeEvent = ( { target: { value } } ) => {
		this.setState( { query: value, inputValue: value } );

		this.props.onChange( { value } );
	};

	handleSuggestionKeyDown = event => {
		if ( this.suggestionsRef.props.suggestions.length > 0 ) {
			let suggestionPosition = this.suggestionsRef.state.suggestionPosition;

			switch ( event.key ) {
				case 'ArrowRight':
					this.updateFieldFromSuggestion( this.getSuggestionLabel( suggestionPosition ) );

					break;
				case 'ArrowUp':
					if ( suggestionPosition === 0 ) {
						suggestionPosition = this.suggestionsRef.props.suggestions.length;
					}

					this.updateFieldFromSuggestion( this.getSuggestionLabel( suggestionPosition - 1 ) );

					break;
				case 'ArrowDown':
					suggestionPosition++;

					if ( suggestionPosition === this.suggestionsRef.props.suggestions.length ) {
						suggestionPosition = 0;
					}

					this.updateFieldFromSuggestion( this.getSuggestionLabel( suggestionPosition ) );

					break;
				case 'Tab':
					this.updateFieldFromSuggestion( this.getSuggestionLabel( suggestionPosition ) );

					break;
				case 'Enter':
					event.preventDefault();
					break;
			}
		}

		this.suggestionsRef.handleKeyEvent( event );
	};

	handleSuggestionMouseDown = position => {
		this.setState( { inputValue: position.label } );
		this.hideSuggestions();

		this.props.onChange( position.label );
	};

	getSuggestions() {
		if ( ! this.state.query ) {
			return [];
		}

		const { suggestions } = this.props;

		const query = this.state.query.trim().toLocaleLowerCase();
		return suggestions
			.filter( hint => hint.toLocaleLowerCase().includes( query ) )
			.map( hint => ( { label: hint } ) );
	}

	getSuggestionLabel( suggestionPosition ) {
		return this.suggestionsRef.props.suggestions[ suggestionPosition ].label;
	}

	updateFieldFromSuggestion( newValue ) {
		this.setState( { inputValue: newValue } );

		this.props.onChange( newValue );
	}

	render() {
		const { id, name, placeholder } = this.props;

		return (
			<>
				<FormTextInput
					id={ id }
					name={ name }
					placeholder={ placeholder }
					value={ this.state.inputValue }
					onChange={ this.handleSuggestionChangeEvent }
					onBlur={ this.hideSuggestions }
					onKeyDown={ this.handleSuggestionKeyDown }
					autoComplete="off"
				/>
				<Suggestions
					ref={ this.setSuggestionsRef }
					query={ this.state.query }
					suggestions={ this.getSuggestions() }
					suggest={ this.handleSuggestionMouseDown }
				/>
			</>
		);
	}
}

export default localize( SuggestionSearch );

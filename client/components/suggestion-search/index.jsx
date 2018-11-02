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
			siteTopicValue: '',
		};
	}

	setSuggestionsRef = ref => {
		this.suggestionsRef = ref;
	};

	hideSuggestions = () => {
		this.setState( { query: '' } );
	};

	handleSuggestionChangeEvent = ( { target: { name, value } } ) => {
		this.setState( { query: value, siteTopicValue: value } );

		this.props.onChange( { name, value } );
	};

	handleSuggestionKeyDown = event => {
		if ( this.suggestionsRef.props.suggestions.length > 0 ) {
			const fieldName = event.target.name;
			let suggestionPosition = this.suggestionsRef.state.suggestionPosition;

			switch ( event.key ) {
				case 'ArrowRight':
					this.updateFieldFromSuggestion(
						this.getSuggestionLabel( suggestionPosition ),
						fieldName
					);

					break;
				case 'ArrowUp':
					if ( suggestionPosition === 0 ) {
						suggestionPosition = this.suggestionsRef.props.suggestions.length;
					}

					this.updateFieldFromSuggestion(
						this.getSuggestionLabel( suggestionPosition - 1 ),
						fieldName
					);

					break;
				case 'ArrowDown':
					suggestionPosition++;

					if ( suggestionPosition === this.suggestionsRef.props.suggestions.length ) {
						suggestionPosition = 0;
					}

					this.updateFieldFromSuggestion(
						this.getSuggestionLabel( suggestionPosition ),
						fieldName
					);

					break;
				case 'Tab':
					this.updateFieldFromSuggestion(
						this.getSuggestionLabel( suggestionPosition ),
						fieldName
					);

					break;
				case 'Enter':
					event.preventDefault();
					break;
			}
		}

		this.suggestionsRef.handleKeyEvent( event );
	};

	handleSuggestionMouseDown = position => {
		this.setState( { siteTopicValue: position.label } );
		this.hideSuggestions();

		this.props.onChange( {
			name: 'siteTopic',
			value: position.label,
		} );
	};

	getSuggestions() {
		if ( ! this.state.query ) {
			return [];
		}

		const { suggestions } = this.props;

		const query = this.state.query.trim().toLocaleLowerCase();
		return Object.values( suggestions )
			.filter( hint => hint.toLocaleLowerCase().includes( query ) )
			.map( hint => ( { label: hint } ) );
	}

	getSuggestionLabel( suggestionPosition ) {
		return this.suggestionsRef.props.suggestions[ suggestionPosition ].label;
	}

	updateFieldFromSuggestion( term, field ) {
		this.setState( { siteTopicValue: term } );

		// this.formStateController.handleFieldChange( {
		// 	name: field,
		// 	value: term,
		// } );
		//
		// Probably need this
		this.props.onChange( {
			name: field,
			value: term,
		} );
	}

	render() {
		const { translate } = this.props;

		return (
			<>
				<FormTextInput
					id="siteTopic"
					name="siteTopic"
					placeholder={ translate( 'e.g. Fashion, travel, design, plumber, electrician' ) }
					value={ this.state.siteTopicValue }
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

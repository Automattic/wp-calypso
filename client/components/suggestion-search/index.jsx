/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { escapeRegExp, noop } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import FormTextInput from 'components/forms/form-text-input';
import Suggestions from 'components/suggestions';
import Spinner from 'components/spinner';
import { isVerticalSearchPending } from 'components/site-verticals-suggestion-search';

/**
 * Style dependencies
 */
import './style.scss';

class SuggestionSearch extends Component {
	static propTypes = {
		id: PropTypes.string,
		placeholder: PropTypes.string,
		onChange: PropTypes.func,
		sortResults: PropTypes.func,
		suggestions: PropTypes.array,
		value: PropTypes.string,
		autoFocus: PropTypes.bool,
		railcar: PropTypes.object,
	};

	static defaultProps = {
		id: '',
		placeholder: '',
		onChange: noop,
		sortResults: null,
		suggestions: [],
		value: '',
		autoFocus: false,
	};

	constructor( props ) {
		super( props );

		this.state = {
			query: '',
			inputValue: props.value,
		};
	}
	componentDidUpdate( prevProps, prevState ) {
		if ( prevProps.value !== this.props.value && this.props.value !== prevState.inputValue ) {
			this.updateInputValue( this.props.value );
		}
	}

	setSuggestionsRef = ref => ( this.suggestionsRef = ref );

	hideSuggestions = () => this.setState( { query: '' } );

	updateInputValue = inputValue => this.setState( { inputValue } );

	handleSuggestionChangeEvent = ( { target: { value } } ) => {
		this.setState( { query: value, inputValue: value } );
		this.props.onChange( value );
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
		this.updateInputValue( position.label );
		this.hideSuggestions();
		this.props.onChange( position.label );
	};

	getSuggestions() {
		if ( ! this.state.query ) {
			return [];
		}

		return ( 'function' === typeof this.props.sortResults
			? this.props.sortResults( this.props.suggestions, this.state.query )
			: this.props.suggestions
		).map( hint => ( { label: hint } ) );
	}

	getSuggestionLabel( suggestionPosition ) {
		return this.suggestionsRef.props.suggestions[ suggestionPosition ].label;
	}

	updateFieldFromSuggestion( newValue ) {
		this.updateInputValue( newValue );
		this.props.onChange( newValue );
	}

	render() {
		const { id, placeholder, autoFocus } = this.props;

		return (
			<div className="suggestion-search">
				{ isVerticalSearchPending() ? <Spinner /> : <Gridicon icon="search" /> }
				<FormTextInput
					id={ id }
					placeholder={ placeholder }
					value={ this.state.inputValue }
					onChange={ this.handleSuggestionChangeEvent }
					onBlur={ this.hideSuggestions }
					onKeyDown={ this.handleSuggestionKeyDown }
					autoComplete="off"
					autoFocus={ autoFocus } // eslint-disable-line jsx-a11y/no-autofocus
				/>
				<Suggestions
					ref={ this.setSuggestionsRef }
					query={ escapeRegExp( this.state.query ) }
					suggestions={ this.getSuggestions() }
					suggest={ this.handleSuggestionMouseDown }
					railcar={ this.props.railcar }
				/>
			</div>
		);
	}
}

export default SuggestionSearch;

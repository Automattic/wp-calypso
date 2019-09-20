/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { escapeRegExp, noop } from 'lodash';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import FormTextInput from 'components/forms/form-text-input';
import Suggestions from 'components/suggestions';
import Spinner from 'components/spinner';

/**
 * Style dependencies
 */
import './style.scss';

class SuggestionSearch extends Component {
	static propTypes = {
		id: PropTypes.string,
		placeholder: PropTypes.string,
		onChange: PropTypes.func,
		onSelect: PropTypes.func,
		suggestions: PropTypes.array,
		value: PropTypes.string,
		autoFocus: PropTypes.bool,
		railcar: PropTypes.object,
		'aria-label': PropTypes.string,
	};

	static defaultProps = {
		id: '',
		placeholder: '',
		onChange: noop,
		onSelect: noop,
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
		if ( this.suggestionsRef.props.suggestions.length > 0 && event.key === 'Enter' ) {
			event.preventDefault();
		}

		this.suggestionsRef.handleKeyEvent( event );
	};

	handleSuggestionMouseDown = position => {
		this.updateInputValue( position.label );
		this.hideSuggestions();
		this.props.onChange( position.label, true );
	};

	getSuggestions() {
		if ( ! this.state.query ) {
			return [];
		}

		return this.props.suggestions.map( hint => ( { label: hint } ) );
	}

	getSuggestionLabel( suggestionPosition ) {
		return this.suggestionsRef.props.suggestions[ suggestionPosition ].label;
	}

	updateFieldFromSuggestion( newValue ) {
		this.updateInputValue( newValue );
		this.props.onChange( newValue, true );
	}

	render() {
		const { id, placeholder, autoFocus, isSearching } = this.props;

		return (
			<div className="suggestion-search">
				{ isSearching ? <Spinner /> : <Gridicon icon="search" /> }
				<FormTextInput
					id={ id }
					placeholder={ placeholder }
					value={ this.state.inputValue }
					onChange={ this.handleSuggestionChangeEvent }
					onBlur={ this.hideSuggestions }
					onKeyDown={ this.handleSuggestionKeyDown }
					autoComplete="off"
					autoFocus={ autoFocus } // eslint-disable-line jsx-a11y/no-autofocus
					aria-label={ this.props[ 'aria-label' ] }
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

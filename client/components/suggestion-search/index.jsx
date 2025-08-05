import { Suggestions, Gridicon, Spinner } from '@automattic/components';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Component } from 'react';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

import './style.scss';

const noop = () => {};

class SuggestionSearch extends Component {
	static propTypes = {
		id: PropTypes.string,
		placeholder: PropTypes.string,
		onChange: PropTypes.func,
		onSelect: PropTypes.func,
		suggestions: PropTypes.arrayOf(
			PropTypes.shape( {
				label: PropTypes.string.isRequired,
				category: PropTypes.string,
			} )
		),
		value: PropTypes.string,
		autoFocus: PropTypes.bool,
		railcar: PropTypes.object,
		'aria-label': PropTypes.string,
		className: PropTypes.string,
		showIcon: PropTypes.bool,
	};

	static defaultProps = {
		id: '',
		placeholder: '',
		onChange: noop,
		onSelect: noop,
		suggestions: [],
		value: '',
		autoFocus: false,
		showIcon: true,
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

	setSuggestionsRef = ( ref ) => ( this.suggestionsRef = ref );

	hideSuggestions = () => this.setState( { query: '' } );

	updateInputValue = ( inputValue ) => this.setState( { inputValue } );

	handleSuggestionChangeEvent = ( { target: { value } } ) => {
		this.setState( { query: value, inputValue: value } );
		this.props.onChange( value );
	};

	handleSuggestionKeyDown = ( event ) => {
		if ( this.suggestionsRef.props.suggestions.length > 0 && event.key === 'Enter' ) {
			event.preventDefault();
		}

		this.suggestionsRef.handleKeyEvent( event );
	};

	handleSuggestionMouseDown = ( suggestion, suggestionIndex ) => {
		this.updateInputValue( suggestion.label );
		this.hideSuggestions();
		this.props.onChange( suggestion.label, true );
		const { railcar } = this.props;
		if ( railcar ) {
			const { action, id } = railcar;
			recordTracksEvent( 'calypso_traintracks_interact', {
				action,
				railcar: `${ id }-${ suggestionIndex }`,
			} );
		}
	};

	getSuggestions() {
		if ( ! this.state.query ) {
			return [];
		}

		return this.props.suggestions;
	}

	getSuggestionLabel( suggestionPosition ) {
		return this.suggestionsRef.props.suggestions[ suggestionPosition ].label;
	}

	updateFieldFromSuggestion( newValue ) {
		this.updateInputValue( newValue );
		this.props.onChange( newValue, true );
	}

	onSuggestionItemMount = ( { index, suggestionIndex } ) => {
		const { railcar } = this.props;
		if ( railcar ) {
			const { fetch_algo, id, ui_algo } = railcar;
			recordTracksEvent( 'calypso_traintracks_render', {
				fetch_algo,
				ui_algo,
				railcar: `${ id }-${ suggestionIndex }`,
				fetch_position: suggestionIndex,
				ui_position: index,
			} );
		}
	};

	render() {
		const { id, placeholder, autoFocus, isSearching, className, showIcon, disabled } = this.props;

		const icon = isSearching ? <Spinner /> : <Gridicon icon="search" />;

		return (
			<div className={ clsx( 'suggestion-search', className ) }>
				{ showIcon && icon }
				<FormTextInput
					id={ id }
					disabled={ disabled }
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
					query={ this.state.query }
					suggestions={ this.getSuggestions() }
					suggest={ this.handleSuggestionMouseDown }
					railcar={ this.props.railcar }
					onSuggestionItemMount={ this.onSuggestionItemMount }
				/>
			</div>
		);
	}
}

export default SuggestionSearch;

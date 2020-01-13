/**
 * External dependencies
 */
import { debounce } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';
import { FormTokenField, Spinner } from '@wordpress/components';

/**
 * Internal dependencies
 */
import './autocomplete-tokenfield.scss';

/**
 * An multi-selecting, api-driven autocomplete input suitable for use in block attributes.
 */
class AutocompleteTokenField extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			suggestions: [],
			validValues: {},
			loading: false,
		};

		this.debouncedUpdateSuggestions = debounce( this.updateSuggestions, 500 )
	}

	/**
	 * When the component loads, fetch information about the tokens so we can populate
	 * the tokens with the correct labels.
	 */
	componentDidMount() {
		const { tokens, fetchSavedInfo } = this.props;

		if ( ! tokens.length || ! fetchSavedInfo ) {
			return;
		}

		this.setState( { loading: true }, () => {
			fetchSavedInfo( tokens )
				.then( results => {
					const { validValues }  = this.state;

					results.forEach( suggestion => {
						validValues[ suggestion.value ] = suggestion.label;
					} );

					this.setState( { validValues, loading: false } );
				} );
		} );
	}

	/**
	 * Clean up any unfinished autocomplete api call requests.
	 */
	componentWillUnmount() {
		delete this.suggestionsRequest;
		this.debouncedUpdateSuggestions.cancel();
	}

	/**
	 * Get a list of labels for input values.
	 *
	 * @param array values Array of values (ids, etc.).
	 * @returns array Array of valid labels corresponding to the values.
	 */
	getLabelsForValues( values ) {
		const { validValues } = this.state;
		return values.reduce(
			( accumulator, value ) =>
				validValues[ value ] ? [ ...accumulator, validValues[ value ] ] : accumulator,
			[]
		);
	}

	/**
	 * Get a list of values for input labels.
	 *
	 * @param array labels Array of labels from the tokens.
	 * @returns array Array of valid values corresponding to the labels.
	 */
	getValuesForLabels( labels ) {
		const { validValues } = this.state;
		return labels.map( label =>
			Object.keys( validValues ).find( key => validValues[ key ] === label )
		);
	}

	/**
	 * Refresh the autocomplete dropdown.
	 */
	updateSuggestions( input ) {
		const { fetchSuggestions } = this.props;
		if ( ! fetchSuggestions ) {
			return;
		}

		this.setState( { loading: true }, () => {
			const request = fetchSuggestions( input );
			request.then( suggestions => { 
				// A fetch Promise doesn't have an abort option. It's mimicked by
				// comparing the request reference in on the instance, which is
				// reset or deleted on subsequent requests or unmounting.
				if ( this.suggestionsRequest !== request ) {
					return;
				}

				const { validValues }  = this.state;
				const currentSuggestions = []

				suggestions.forEach( suggestion => {
					currentSuggestions.push( suggestion.label );
					validValues[ suggestion.value ] = suggestion.label;
				} );

				this.setState( { suggestions: currentSuggestions, validValues, loading: false } );
			} ).catch( () => {
				if ( this.suggestionsRequest === request ) {
					this.setState( {
						loading: false,
					} );
				}
			} );

			this.suggestionsRequest = request;
		} );
	}

	/**
	 * When a token is selected, we need to convert the string label into a recognized value suitable for saving as an attribute.
	 *
	 * @param array tokenStrings An array of token label strings.
	 */
	handleOnChange( tokenStrings ) {
		const { onChange } = this.props;
		onChange( this.getValuesForLabels( tokenStrings ) );
	}

	/**
	 * To populate the tokens, we need to convert the values into a human-readable label.
	 *
	 * @returns array An array of token label strings.
	 */
	getTokens() {
		const { tokens } = this.props;
		return this.getLabelsForValues( tokens );
	}

	/**
	 * Render.
	 */
	render() {
		const { label = '' } = this.props;
		const { suggestions, loading } = this.state;

		return (
			<div className='autocomplete-tokenfield'>
				<FormTokenField
					value={ this.getTokens() }
					suggestions={ suggestions }
					onChange={ tokens => this.handleOnChange( tokens ) }
					onInputChange={ input => this.debouncedUpdateSuggestions( input ) }
					label={ label }
				/>
				{ loading && <Spinner /> }
			</div>
		);
	}
}

export default AutocompleteTokenField;
/**
 * External dependencies
 */
import React from 'react';
import {
	has,
	noop,
	pick,
	pickBy,
	without,
	negate,
	isEmpty,
	take,
	sortBy,
	partition,
	includes,
} from 'lodash';
import classNames from 'classnames';
import i18n from 'i18n-calypso';

function SuggestionsButtonAll( props ) {
	function click() {
		return props.onClick( props.category );
	}

	return <span
		className="suggestions__category-show-all"
		onClick={ click }>
		{ props.label }
	</span>;
}

class Suggestions extends React.Component {

	static propTypes = {
		suggest: React.PropTypes.func,
		terms: React.PropTypes.object,
		input: React.PropTypes.string,
	}

	static defaultProps = {
		suggest: noop,
		terms: {},
		input: '',
	}

	state = {
		suggestionPosition: 0,
		currentSuggestion: null,
		suggestions: {},
		filterTerm: '',
		showAll: ''
	}

	setInitialState = ( input ) => {
		const suggestions = this.narrowDownAndSort( input, this.state.showAll );
		const taxonomySuggestionsArray = this.createTaxonomySuggestionsArray( suggestions );
		this.setState( {
			suggestions,
			taxonomySuggestionsArray,
			suggestionPosition: 0,
			currentSuggestion: taxonomySuggestionsArray[ 0 ],
		} );
	}

	componentWillMount() {
		this.setInitialState( this.props.input );
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.input !== this.props.input ) {
			this.setInitialState( nextProps.input );
		}
	}

	countSuggestions = () => {
		return this.state.taxonomySuggestionsArray.length;
	}

	getSuggestionForPosition = ( position ) => {
		return this.state.taxonomySuggestionsArray[ position ];
	}

	getPositionForSuggestion = ( suggestion ) => {
		return this.state.taxonomySuggestionsArray.indexOf( suggestion );
	}

	incPosition = () => {
		const position = ( this.state.suggestionPosition + 1 ) % this.countSuggestions();
		this.setState( {
			suggestionPosition: position,
			currentSuggestion: this.getSuggestionForPosition( position ),
		} );
	}

	decPosition = () => {
		const position = this.state.suggestionPosition - 1;
		this.setState( {
			suggestionPosition: position < 0 ? this.countSuggestions() - 1 : position,
			currentSuggestion: this.getSuggestionForPosition( position )
		} );
	}

	/**
	 * Provides keybord support for suggestings component by managing items highlith position
	 * and calling suggestion callback when user hits Enter
	 *
	 * @param  {Object} event  Keybord event
	 * @return {Bool}          true indicates suggestion was chosen and send to parent using suggest prop callback
	 */
	handleKeyEvent = ( event ) => {
		switch ( event.key ) {
			case 'ArrowDown' :
				this.incPosition();
				event.preventDefault();
				break;
			case 'ArrowUp' :
				this.decPosition();
				event.preventDefault();
				break;
			case 'Enter' :
				if ( !! this.state.currentSuggestion ) {
					this.props.suggest( this.state.currentSuggestion );
					return true;
				}
				break;
		}
		return false;
	}

	onMouseDown = ( event ) => {
		event.stopPropagation();
		event.preventDefault();
		//Additional empty space at the end adds fluidity to workflow
		this.props.suggest( event.target.textContent );
	}

	onMouseOver = ( event ) => {
		this.setState( {
			suggestionPosition: this.getPositionForSuggestion( event.target.textContent ),
			currentSuggestion: event.target.textContent,
		} );
	}

	removeEmptySuggestions = ( suggestions ) => {
		return pickBy( suggestions, negate( isEmpty ) );
	}

	/**
	 * Returns an object containing lists of fliters keyed by taxnomies.
	 * This function takes all available taxonomies and removes the ones that
	 * do not match provided input param. At the end keys that have empty lists are removed.
	 * showAll parameter if provided sidesteps the matching logic for the key value in showAll
	 * and passes all filters for that key. For showAll also soome reordering happens - explained in code
	 *
	 * @param  {String}  input   text that will be matched against the taxonomies
	 * @param  {String}  showAll taxonomy for which we want all filters
	 * @return {Object}          filtered taxonomy:[ terms ] object
	 */
	narrowDownAndSort = ( input, showAll = '' ) => {
		const [ taxonomy, filter ] = input.split( ':' );
		if ( taxonomy === '' ) {
			// empty string or just ":" or ":filter" -
			// TODO: just show welcome screen
			return {};
		}

		let limit = 3; //default limit, changed to 5 for single taxonomy
		let terms; //terms that we will use to create suggestions
		let filterTerm; // part of input that will be used for filtering

		if ( filter !== undefined ) {
			// this means that we have at least taxonomy:
			// so check if this is a correct taxonomy
			if ( has( this.props.terms, taxonomy ) ) {
				//so we will only filter elements from this taxonomy
				terms = pick( this.props.terms, taxonomy );
				//limit to 5 suggestions
				limit = 5;
			} else {
				// not a valid taxonomy
				// TODO tell something to the user
				return {};
			}
			filterTerm = filter;
		} else {
			// we just have one word so treat is as a search terms
			filterTerm = taxonomy;
			terms = this.props.terms;
		}

		const filtered = {};

		//If this is valid full taxonomy:filter we want to show alternatives instead of suggestions
		if ( filter !== undefined && includes( terms[ taxonomy ], filter ) ) {
			// remove what is already in input - so we can add it to the beggining of the list
			const otherSuggestions = without( terms[ taxonomy ], filter );
			// add back at the beggining of the list so it will showup first.
			otherSuggestions.unshift( filter );
			// limit or show all
			filtered[ taxonomy ] = showAll === taxonomy ? otherSuggestions : take( otherSuggestions, limit );
			return filtered;
		}

		// store filtering term for highlithing
		this.setState( { filterTerm } );

		for ( const key in terms ) {
			if ( ! has( this.props.terms, key ) ) {
				continue;
			}

			//check if we have showAll key match. If we have then don't filter, use all and reorder.
			if ( showAll === key ) {
				// split to terms matching an non matching to the input
				const parts = partition( terms[ key ], term => term.indexOf( filterTerm ) !== -1 );
				// sort matching so that the best hit is first
				const matchingSorted = sortBy( parts[ 0 ], term => term.indexOf( filterTerm ) );
				// concatenate mathing and non matchin - this is full set of filters just reordered.
				filtered[ key ] = [ ...matchingSorted, ...parts[ 1 ] ];
			} else {
				filtered[ key ] = take(
					terms[ key ].filter( term => term.indexOf( filterTerm ) !== -1 ),
					limit
				);
			}
		}

		return this.removeEmptySuggestions( filtered );
	}

	createTaxonomySuggestionsArray = ( suggestions ) => {
		const taxonomySuggestionsArray = [];

		for ( const key in suggestions ) {
			if ( ! has( suggestions, key ) ) {
				continue;
			}
			taxonomySuggestionsArray.push( ... suggestions[ key ].map( value => key + ':' + value ) );
		}

		return taxonomySuggestionsArray;
	}

	createTextWithHighlight = ( text, highlightedText ) => {
		const re = new RegExp( '(' + highlightedText + ')', 'g' );
		const parts = text.split( re );
		const token = parts.map( ( part, i ) => {
			const key = text + i;
			if ( part === highlightedText ) {
				return <span key={ key } className="suggestions__value-emphasis" >{ part }</span>;
			}
			return <span key={ key }className="suggestions__value-normal" >{ part }</span>;
		} );

		return token;
	}

	onShowAllClick = ( category ) => {
		const suggestions = this.narrowDownAndSort( this.props.input, category );
		this.setState( {
			showAll: category,
			suggestions,
			taxonomySuggestionsArray: this.createTaxonomySuggestionsArray( suggestions )
		} );
	}

	createSuggestions = ( suggestions ) => {
		let noOfSuggestions = 0;
		const rendered = [];

		for ( const key in suggestions ) {
			if ( ! has( suggestions, key ) ) {
				continue;
			}

			const filtered = suggestions[ key ].length.toString();
			const total = this.props.terms[ key ].length.toString();
			//Add header
			rendered.push(
				<div className="suggestions__category" key={ key }>
					<span className="suggestions__category-name">{ key }</span>
					<span className="suggestions__category-counter">
						{ i18n.translate( '%(filtered)s of %(total)s', {
							args: { filtered, total }
						} ) }
					</span>
					{ this.props.terms[ key ].length > suggestions[ key ].length &&
						<SuggestionsButtonAll
							onClick={ this.onShowAllClick }
							category={ key }
							label={ i18n.translate( 'Show all' ) } /> }
					{ key === this.state.showAll &&
						<SuggestionsButtonAll
							onClick={ this.onShowAllClick }
							category={ '' }
							label={ i18n.translate( 'Show less' ) } /> }
				</div>
			);
			//Add values
			rendered.push( suggestions[ key ].map( ( value, i ) => {
				const hasHighlight = ( noOfSuggestions + i ) === this.state.suggestionPosition;
				const className = classNames( 'suggestions__value', { 'has-highlight': hasHighlight } );
				return (
					<span className={ className } onMouseDown={ this.onMouseDown } onMouseOver={ this.onMouseOver } key={ key + '_' + i }>
						<span className="suggestions__value-category">{ key + ':' }</span>
						{ this.createTextWithHighlight( value, this.state.filterTerm ) }
					</span>
				);
			} ) );

			noOfSuggestions += suggestions[ key ].length;
		}

		return <div className="suggestions__suggestions">{ rendered }</div>;
	}

	render() {
		return (
			<div className="suggestions">{ this.createSuggestions( this.state.suggestions ) }</div>
		);
	}

}

export default Suggestions;

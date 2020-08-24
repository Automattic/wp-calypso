/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import {
	has,
	noop,
	pick,
	pickBy,
	without,
	negate,
	isEmpty,
	take,
	filter,
	map,
	sortBy,
	partition,
	includes,
} from 'lodash';
import classNames from 'classnames';
import i18n from 'i18n-calypso';

/**
 * Style dependencies
 */
import './style.scss';

function SuggestionsButtonAll( props ) {
	function click() {
		return props.onClick( props.category );
	}

	return (
		<button className="keyed-suggestions__category-show-all" onClick={ click }>
			{ props.label }
		</button>
	);
}

class KeyedSuggestions extends React.Component {
	static propTypes = {
		suggest: PropTypes.func,
		terms: PropTypes.object,
		input: PropTypes.string,
	};

	static defaultProps = {
		suggest: noop,
		terms: {},
		input: '',
	};

	state = {
		suggestionPosition: 0,
		currentSuggestion: null,
		suggestions: {},
		filterTerm: '',
		showAll: '',
	};

	setInitialState = ( input ) => {
		const suggestions = this.narrowDownAndSort( input, this.state.showAll );
		const taxonomySuggestionsArray = this.createTaxonomySuggestionsArray( suggestions );
		this.setState( {
			suggestions,
			taxonomySuggestionsArray,
			suggestionPosition: 0,
			currentSuggestion: taxonomySuggestionsArray[ 0 ],
		} );
	};

	UNSAFE_componentWillMount() {
		this.setInitialState( this.props.input );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( nextProps.input !== this.props.input ) {
			this.setInitialState( nextProps.input );
		}
	}

	countSuggestions = () => {
		return this.state.taxonomySuggestionsArray.length;
	};

	getSuggestionForPosition = ( position ) => {
		return this.state.taxonomySuggestionsArray[ position ];
	};

	getPositionForSuggestion = ( suggestion ) => {
		return this.state.taxonomySuggestionsArray.indexOf( suggestion );
	};

	incPosition = () => {
		const position = ( this.state.suggestionPosition + 1 ) % this.countSuggestions();
		this.setState( {
			suggestionPosition: position,
			currentSuggestion: this.getSuggestionForPosition( position ),
		} );
	};

	decPosition = () => {
		const position = this.state.suggestionPosition - 1;
		this.setState( {
			suggestionPosition: position < 0 ? this.countSuggestions() - 1 : position,
			currentSuggestion: this.getSuggestionForPosition( position ),
		} );
	};

	/**
	 * Provides keybord support for suggestings component by managing items highlith position
	 * and calling suggestion callback when user hits Enter
	 *
	 * @param  {object} event  Keybord event
	 * @returns {boolean}      true indicates suggestion was chosen and send to parent using suggest prop callback
	 */
	handleKeyEvent = ( event ) => {
		switch ( event.key ) {
			case 'ArrowDown':
				this.incPosition();
				event.preventDefault();
				break;
			case 'ArrowUp':
				this.decPosition();
				event.preventDefault();
				break;
			case 'Enter':
				if ( this.state.currentSuggestion ) {
					this.props.suggest( this.state.currentSuggestion );
					return true;
				}
				break;
		}
		return false;
	};

	onMouseDown = ( event ) => {
		event.stopPropagation();
		event.preventDefault();
		const suggestion = event.currentTarget.textContent.split( ' ' )[ 0 ];
		this.props.suggest( suggestion );
	};

	onMouseOver = ( event ) => {
		const suggestion = event.currentTarget.textContent.split( ' ' )[ 0 ];
		this.setState( {
			suggestionPosition: this.getPositionForSuggestion( suggestion ),
			currentSuggestion: suggestion,
		} );
	};

	removeEmptySuggestions = ( suggestions ) => {
		return pickBy( suggestions, negate( isEmpty ) );
	};

	/**
	 * Returns an object containing lists of filters keyed by taxnomies.
	 * This function takes all available taxonomies and removes the ones that
	 * do not match provided input param. At the end keys that have empty lists are removed.
	 * showAll parameter if provided sidesteps the matching logic for the key value in showAll
	 * and passes all filters for that key. For showAll also soome reordering happens - explained in code
	 *
	 * @param  {string}  input   text that will be matched against the taxonomies
	 * @param  {string}  showAll taxonomy for which we want all filters
	 * @returns {object}          filtered taxonomy:[ terms ] object
	 */
	narrowDownAndSort = ( input, showAll = '' ) => {
		const termsTable = this.props.terms;
		const [ taxonomy, filterText ] = input.split( ':' );
		if ( taxonomy === '' ) {
			// empty string or just ":" or ":filter" -
			// TODO: just show welcome screen
			return {};
		}

		let limit = 3; //default limit, changed to 5 for single taxonomy
		let terms; //terms that we will use to create suggestions
		let filterTerm; // part of input that will be used for filtering

		if ( filterText !== undefined ) {
			// this means that we have at least taxonomy:
			// so check if this is a correct taxonomy
			if ( has( termsTable, taxonomy ) ) {
				//so we will only filter elements from this taxonomy
				terms = pick( termsTable, taxonomy );
				//limit to 5 suggestions
				limit = 5;
			} else {
				// not a valid taxonomy
				// TODO tell something to the user
				return {};
			}
			filterTerm = filterText;
		} else {
			// we just have one word so treat is as a search terms
			filterTerm = taxonomy;
			terms = termsTable;
		}

		const filtered = {};

		//If this is valid full taxonomy:filter we want to show alternatives instead of suggestions
		if ( filterText !== undefined && includes( terms[ taxonomy ], filter ) ) {
			// remove what is already in input - so we can add it to the beggining of the list
			const otherSuggestions = without( terms[ taxonomy ], filter );
			// add back at the beggining of the list so it will showup first.
			otherSuggestions.unshift( filterText );
			// limit or show all
			filtered[ taxonomy ] =
				showAll === taxonomy ? otherSuggestions : take( otherSuggestions, limit );
			return filtered;
		}

		// store filtering term for highlithing
		this.setState( { filterTerm } );

		for ( const key in terms ) {
			if ( ! has( this.props.terms, key ) ) {
				continue;
			}

			// Try a full match first and try substring matches
			let multiRegex = filterTerm;
			for ( let i = filterTerm.length; i > 1; i-- ) {
				multiRegex += '|' + filterTerm.replace( new RegExp( '(.{' + i + '})', 'g' ), '$1.*' );
			}
			const regex = new RegExp( multiRegex, 'iu' );

			// Check if we have showAll key match. If we have then don't filter, use all and reorder.
			if ( showAll === key ) {
				const ourTerms = terms[ key ];
				const keys = Object.keys( ourTerms );
				// Split to terms matching an non matching to the input.
				const [ matching, notMatching ] = partition( keys, ( term ) => {
					return (
						ourTerms[ term ].name.match( regex ) || ourTerms[ term ].description.match( regex )
					);
				} );
				// Sort matching so that the best hit is first.
				const sortedMatching = sortBy( matching, ( match ) => {
					const term = ourTerms[ match ];
					const termString = term.name + ' ' + term.description;
					const hitIndex = termString.toLowerCase().indexOf( filterTerm.toLowerCase() );
					return hitIndex >= 0 && hitIndex;
				} );
				// Concatenate mathing and non matchin - this is full set of filters just reordered.
				filtered[ key ] = [ ...sortedMatching, ...notMatching ];
			} else {
				filtered[ key ] = take(
					filter(
						map( terms[ key ], ( term, k ) =>
							term.name.match( regex ) || term.description.match( regex ) ? k : null
						)
					),
					limit
				);
			}
		}
		return this.removeEmptySuggestions( filtered );
	};

	createTaxonomySuggestionsArray = ( suggestions ) => {
		const taxonomySuggestionsArray = [];

		for ( const key in suggestions ) {
			if ( ! has( suggestions, key ) ) {
				continue;
			}
			taxonomySuggestionsArray.push( ...suggestions[ key ].map( ( value ) => key + ':' + value ) );
		}

		return taxonomySuggestionsArray;
	};

	createTextWithHighlight = ( text, highlightedText ) => {
		const re = new RegExp( '(' + highlightedText + ')', 'gi' );
		const parts = text.split( re );
		const token = parts.map( ( part, i ) => {
			const key = text + i;
			const lowercasePart = part.toLowerCase();
			if ( lowercasePart === highlightedText ) {
				return (
					<span key={ key } className="keyed-suggestions__value-emphasis">
						{ part }
					</span>
				);
			}
			return (
				<span key={ key } className="keyed-suggestions__value-normal">
					{ part }
				</span>
			);
		} );

		return token;
	};

	onShowAllClick = ( category ) => {
		const suggestions = this.narrowDownAndSort( this.props.input, category );
		this.setState( {
			showAll: category,
			suggestions,
			taxonomySuggestionsArray: this.createTaxonomySuggestionsArray( suggestions ),
		} );
	};

	createSuggestions = ( suggestions ) => {
		let noOfSuggestions = 0;
		const rendered = [];

		const taxonomyTranslations = {
			feature: i18n.translate( 'Feature', {
				context: 'Theme Showcase filter name',
			} ),
			layout: i18n.translate( 'Layout', {
				context: 'Theme Showcase filter name',
			} ),
			column: i18n.translate( 'Columns', {
				context: 'Theme Showcase filter name',
			} ),
			subject: i18n.translate( 'Subject', {
				context: 'Theme Showcase filter name',
			} ),
			style: i18n.translate( 'Style', {
				context: 'Theme Showcase filter name',
			} ),
		};

		for ( const key in suggestions ) {
			if ( ! has( suggestions, key ) ) {
				continue;
			}

			const filtered = suggestions[ key ].length.toString();
			const total = Object.keys( this.props.terms[ key ] ).length.toString();
			//Add header
			rendered.push(
				<div className="keyed-suggestions__category" key={ key }>
					<span className="keyed-suggestions__category-name">{ taxonomyTranslations[ key ] }</span>
					<span className="keyed-suggestions__category-counter">
						{ i18n.translate( '%(filtered)s of %(total)s', {
							args: { filtered, total },
						} ) }
					</span>
					{ Object.keys( this.props.terms[ key ] ).length > suggestions[ key ].length && (
						<SuggestionsButtonAll
							onClick={ this.onShowAllClick }
							category={ key }
							label={ i18n.translate( 'Show all' ) }
						/>
					) }
					{ key === this.state.showAll && (
						<SuggestionsButtonAll
							onClick={ this.onShowAllClick }
							category={ '' }
							label={ i18n.translate( 'Show less' ) }
						/>
					) }
				</div>
			);
			//Add values
			const { terms } = this.props;
			rendered.push(
				suggestions[ key ].map( ( value, i ) => {
					const taxonomyName = terms[ key ][ value ].name;
					const hasHighlight = noOfSuggestions + i === this.state.suggestionPosition;
					const className = classNames( 'keyed-suggestions__value', {
						'has-highlight': hasHighlight,
					} );
					return (
						/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/mouse-events-have-key-events */
						<span
							className={ className }
							onMouseDown={ this.onMouseDown }
							onMouseOver={ this.onMouseOver }
							key={ key + '_' + i }
						>
							<span className="keyed-suggestions__value-category">{ key + ':' + value + ' ' }</span>
							<span className="keyed-suggestions__value-label-wigh-highlight">
								{ this.createTextWithHighlight( taxonomyName, this.state.filterTerm ) }
							</span>
							{ terms[ key ][ value ].description !== '' && (
								<span className="keyed-suggestions__value-description">
									{ terms[ key ][ value ].description }
								</span>
							) }
						</span>
						/* eslint-enable jsx-a11y/no-static-element-interactions, jsx-a11y/mouse-events-have-key-events */
					);
				} )
			);

			noOfSuggestions += suggestions[ key ].length;
		}

		return <div className="keyed-suggestions__suggestions">{ rendered }</div>;
	};

	render() {
		return (
			<div className="keyed-suggestions">{ this.createSuggestions( this.state.suggestions ) }</div>
		);
	}
}

export default KeyedSuggestions;

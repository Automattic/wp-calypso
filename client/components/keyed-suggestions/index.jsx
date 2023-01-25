import { Icon, typography, layout } from '@wordpress/icons';
import classNames from 'classnames';
import i18n from 'i18n-calypso';
import { has, pick, pickBy, without, isEmpty, map, sortBy, partition, includes } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { cosineSimilarity } from 'calypso/lib/trigram';

import './style.scss';

const SEARCH_THRESHOLD = 0.45;
const TAXONOMY_ICONS = {
	feature: typography,
	subject: (
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
			<path d="M4 9h16v2H4V9zm0 4h10v2H4v-2z" />
		</svg>
	),
	column: layout,
};

const getTaxonomyTranslations = () => ( {
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
} );

const noop = () => {};

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

class KeyedSuggestions extends Component {
	static propTypes = {
		suggest: PropTypes.func,
		terms: PropTypes.object,
		input: PropTypes.string,
		exclusions: PropTypes.array,
		showAllLabelText: PropTypes.string,
		showLessLabelText: PropTypes.string,
		isShowTopLevelTermsOnMount: PropTypes.bool,
		isDisableAutoSelectSuggestion: PropTypes.bool,
		isDisableTextHighlight: PropTypes.bool,
		recordTracksEvent: PropTypes.func,
	};

	static defaultProps = {
		suggest: noop,
		terms: {},
		input: '',
		exclusions: [],
		recordTracksEvent: noop,
	};

	state = {
		suggestionPosition: ! this.props.isDisableAutoSelectSuggestion ? 0 : -1,
		currentSuggestion: null,
		suggestions: {},
		filterTerm: '',
		showAll: '',
		isShowTopLevelTerms: false,
	};

	setInitialState = ( input, isShowTopLevelTerms ) => {
		const { terms, isDisableAutoSelectSuggestion } = this.props;
		const suggestions = this.narrowDownAndSort( input, this.state.showAll );
		const taxonomySuggestionsArray = isShowTopLevelTerms
			? Object.keys( terms ).map( ( key ) => key + ':' )
			: this.createTaxonomySuggestionsArray( suggestions );

		this.setState( {
			suggestions,
			taxonomySuggestionsArray,
			suggestionPosition: ! isDisableAutoSelectSuggestion ? 0 : -1,
			currentSuggestion: ! isDisableAutoSelectSuggestion ? taxonomySuggestionsArray[ 0 ] : null,
			isShowTopLevelTerms,
		} );
	};

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillMount() {
		this.setInitialState( this.props.input, this.props.isShowTopLevelTermsOnMount );
	}

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( nextProps.input !== this.props.input ) {
			this.setInitialState(
				nextProps.input,
				nextProps.isShowTopLevelTermsOnMount && nextProps.input === ''
			);
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
		const suggestionPosition = position < 0 ? this.countSuggestions() - 1 : position;
		this.setState( {
			suggestionPosition,
			currentSuggestion: this.getSuggestionForPosition( suggestionPosition ),
		} );
	};

	sanitizeInput = ( input ) => input.replace( /[-/\\^$*+?.()|[\]{}]/g, '' );

	/**
	 * Provides keybord support for suggestings component by managing items highlith position
	 * and calling suggestion callback when user hits Enter
	 *
	 * @param  {Object} event  Keybord event
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
					this.props.suggest( this.state.currentSuggestion, this.state.isShowTopLevelTerms );
					return true;
				}
				break;
		}
		return false;
	};

	onMouseDown = ( event ) => {
		event.stopPropagation();
		event.preventDefault();

		const { suggest, recordTracksEvent } = this.props;
		const suggestion = event.currentTarget.textContent.split( ' ' )[ 0 ];
		if ( this.state.isShowTopLevelTerms ) {
			// Clean up suggestion that it's passed as, for example, "feature" instead of "feature:".
			recordTracksEvent( 'search_dropdown_taxonomy_click', {
				taxonomy: suggestion.split( ':' )[ 0 ],
			} );
		} else {
			recordTracksEvent( 'search_dropdown_taxonomy_term_click', { term: suggestion } );
		}

		suggest( suggestion, this.state.isShowTopLevelTerms );
	};

	onMouseOver = ( event ) => {
		const suggestion = event.currentTarget.textContent.split( ' ' )[ 0 ];
		this.setState( {
			suggestionPosition: this.getPositionForSuggestion( suggestion ),
		} );
	};

	removeEmptySuggestions = ( suggestions ) => {
		return pickBy( suggestions, ( suggestion ) => ! isEmpty( suggestion ) );
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
	 * @returns {Object}          filtered taxonomy:[ terms ] object
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
		if ( filterText !== undefined && includes( terms[ taxonomy ], filterText ) ) {
			// remove what is already in input - so we can add it to the beggining of the list
			const otherSuggestions = without( terms[ taxonomy ], filterText );
			// add back at the beggining of the list so it will showup first.
			otherSuggestions.unshift( filterText );
			// limit or show all
			filtered[ taxonomy ] =
				showAll === taxonomy ? otherSuggestions : otherSuggestions.slice( 0, limit );
			return filtered;
		}

		// store filtering term for highlithing
		this.setState( { filterTerm } );

		for ( const key in terms ) {
			if ( ! has( this.props.terms, key ) ) {
				continue;
			}

			// Try a full match first and try substring matches
			const cleanFilterTerm = this.sanitizeInput( filterTerm );

			let onlyFullMatch = false;

			/**
			 * Check the filter term against any exclusions. If it matches any exclusions, then we only match against the full term instead of splitting it up or matching based on similarity.
			 */
			for ( const exc of this.props.exclusions ) {
				if ( cleanFilterTerm.match( exc ) ) {
					onlyFullMatch = true;
					break;
				}
			}

			let multiRegex = cleanFilterTerm;
			if ( ! onlyFullMatch ) {
				for ( let i = cleanFilterTerm.length - 1; i > 1; i-- ) {
					multiRegex +=
						'|' + cleanFilterTerm.replace( new RegExp( '(.{' + i + '})', 'g' ), '$1\\w+' );
				}
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
					const hitIndex = termString.toLowerCase().indexOf( cleanFilterTerm.toLowerCase() );
					return hitIndex >= 0 && hitIndex;
				} );
				// Concatenate mathing and non matchin - this is full set of filters just reordered.
				filtered[ key ] = [ ...sortedMatching, ...notMatching ];
			} else {
				// Matcher is designed to be used with args (term.name, cleanFilterTerm)
				// Order is important!
				// Arg 1 can be multiple words. "flexible header" or "accepts header images of any size"
				// Arg 2 will only be one word; even if the user types multiple words we search on each one individually.
				const matcher = ( term1, term2_single ) => {
					// Our term matched an exclusion so we never match on similarity.
					if ( onlyFullMatch ) {
						return false;
					}

					let max_seen = 0;
					for ( const term1_single of term1.split( /\s+/ ) ) {
						const sim = cosineSimilarity( term1_single, term2_single );
						max_seen = Math.max( max_seen, sim );
					}
					return max_seen > SEARCH_THRESHOLD;
				};

				filtered[ key ] = map( terms[ key ], ( term, k ) =>
					cleanFilterTerm === '' ||
					matcher( term.name.toLowerCase(), cleanFilterTerm.toLowerCase() )
						? k
						: null
				)
					.filter( Boolean )
					.slice( 0, limit );
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
		const re = new RegExp( '(' + this.sanitizeInput( highlightedText ) + ')', 'gi' );
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

	createTopLevelTermsSuggestions = () => (
		<div className="keyed-suggestions__suggestions">
			<div className="keyed-suggestions__category" key="search-by">
				<span className="keyed-suggestions__category-name">
					{ i18n.translate( 'Search by', {
						context: 'Theme Showcase filter name',
					} ) }
				</span>
			</div>
			{ Object.keys( this.props.terms ).map( ( key, i ) => {
				const isSelected = i === this.state.suggestionPosition;
				const className = classNames( 'keyed-suggestions__value', {
					'is-selected': isSelected,
				} );

				return (
					/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/mouse-events-have-key-events */
					<span
						className={ className }
						onMouseDown={ this.onMouseDown }
						onMouseOver={ this.onMouseOver }
						key={ key }
					>
						<span className="keyed-suggestions__value-category">{ key + ': ' }</span>
						<span
							className={ classNames( 'keyed-suggestions__value-icon', {
								'needs-offset': key === 'feature',
							} ) }
						>
							<Icon icon={ TAXONOMY_ICONS[ key ] } size={ 24 } />
						</span>
						<span className="keyed-suggestions__value-label">
							<span className="keyed-suggestions__value-normal">
								{ getTaxonomyTranslations()[ key ] }
							</span>
						</span>
						<span className="keyed-suggestions__value-description">
							{ Object.keys( this.props.terms[ key ] ).length.toString() }
						</span>
					</span>
					/* eslint-enable jsx-a11y/no-static-element-interactions, jsx-a11y/mouse-events-have-key-events */
				);
			} ) }
		</div>
	);

	createSuggestions = ( suggestions ) => {
		let noOfSuggestions = 0;
		const rendered = [];

		for ( const key in suggestions ) {
			if ( ! has( suggestions, key ) ) {
				continue;
			}

			const filtered = suggestions[ key ].length.toString();
			const total = Object.keys( this.props.terms[ key ] ).length.toString();
			//Add header
			rendered.push(
				<div className="keyed-suggestions__category" key={ key }>
					<span className="keyed-suggestions__category-name">
						{ getTaxonomyTranslations()[ key ] }
					</span>
					<span className="keyed-suggestions__category-counter">
						{ key === this.state.showAll
							? total
							: i18n.translate( '%(filtered)s of %(total)s', {
									args: { filtered, total },
							  } ) }
					</span>
					{ Object.keys( this.props.terms[ key ] ).length > suggestions[ key ].length && (
						<SuggestionsButtonAll
							onClick={ ( category ) => {
								this.onShowAllClick( category );
								this.props.recordTracksEvent( 'search_dropdown_view_all_button_click', {
									category: key,
								} );
							} }
							category={ key }
							label={ this.props.showAllLabelText || i18n.translate( 'Show all' ) }
						/>
					) }
					{ key === this.state.showAll && (
						<SuggestionsButtonAll
							onClick={ ( category ) => {
								this.onShowAllClick( category );
								this.props.recordTracksEvent( 'search_dropdown_view_less_button_click', {
									category: key,
								} );
							} }
							category=""
							label={ this.props.showLessLabelText || i18n.translate( 'Show less' ) }
						/>
					) }
				</div>
			);
			//Add values
			const { terms } = this.props;
			rendered.push(
				suggestions[ key ].map( ( value, i ) => {
					const taxonomyName = terms[ key ][ value ].name;
					const isSelected = noOfSuggestions + i === this.state.suggestionPosition;
					const className = classNames( 'keyed-suggestions__value', {
						'is-selected': isSelected,
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
							{ ! this.props.isDisableTextHighlight ? (
								<span className="keyed-suggestions__value-label-wigh-highlight">
									{ this.createTextWithHighlight( taxonomyName, this.state.filterTerm ) }
								</span>
							) : (
								<span className="keyed-suggestions__value-label">
									<span className="keyed-suggestions__value-normal">{ taxonomyName }</span>
								</span>
							) }
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
			<div
				className={ classNames( 'keyed-suggestions', {
					'is-empty': this.state.taxonomySuggestionsArray.length === 0,
				} ) }
			>
				{ this.state.isShowTopLevelTerms
					? this.createTopLevelTermsSuggestions()
					: this.createSuggestions( this.state.suggestions ) }
			</div>
		);
	}
}

export default KeyedSuggestions;

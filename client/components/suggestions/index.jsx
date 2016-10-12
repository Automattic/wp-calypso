/**
 * External dependencies
 */
import React from 'react';
import {
	noop,
	pick,
	pickBy
}	from 'lodash';

/**
 * Internal dependencies
 */

const Suggestions = React.createClass( {

	propTypes: {
		weolcomeSign: React.PropTypes.func,
		suggest: React.PropTypes.func,
		terms: React.PropTypes.object,
		input: React.PropTypes.string
	},

	getDefaultProps: function() {
		return {
			weolcomeSign: noop,
			suggest: noop,
			terms: {},
			input: "",
			suggestions: {},
			filterTerm: ""
		}
	},

	getInitialState: function() {
		return {
			taxonomySuggestionsArray: [],
			suggestionPosition: -1,
		};
	},

	componentDidMount: function() {
	},

	componentDidUpdate: function() {
	},

	componentWillMount: function() {
		const suggestions = this.narrowDown( this.props.input )
		this.setState( {
			suggestions: suggestions,
			currentSuggestion: "",
		} );
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( nextProps.input !== this.props.input ) {
			const suggestions = this.narrowDown( nextProps.input )
			this.setState( {
				suggestions: suggestions,
				suggestionPosition: -1,
				currentSuggestion: "",
			} );
		}
	},

	countSuggestions: function() {
		return this.state.taxonomySuggestionsArray.length;
	},

	getSuggestionForPosition: function( position ) {
		return this.state.taxonomySuggestionsArray[ position ];
	},

	getPositionForSuggestion: function( suggestion ) {
		return this.state.taxonomySuggestionsArray.indexOf( suggestion );
	},

	incPosition: function() {
		const position = ( this.state.suggestionPosition + 1 ) % this.countSuggestions();
		this.setState( {
			suggestionPosition: position,
			currentSuggestion: this.getSuggestionForPosition( position ),
		} );
	},

	decPosition: function() {
		const position = ( this.state.suggestionPosition - 1 ) % this.countSuggestions();
		this.setState( {
			suggestionPosition: position,
			currentSuggestion: this.getSuggestionForPosition( position )
		} );
	},

	handleKeyEvent: function( event ) {
		switch( event.key ) {
			case "ArrowDown" :
				this.incPosition();
				event.preventDefault();
				break;
			case "ArrowUp" :
				this.decPosition();
				event.preventDefault();
				break;
			case "Enter" :
				if( this.state.suggestionPosition !== -1 ) {
					this.props.suggest( this.state.currentSuggestion );
				}
				break;
		}

	},

	onMouseDown: function( event ) {
		this.props.suggest( event.target.textContent );
	},

	removeEmptySuggestions: function( suggestions ) {
		const hasValues = x => x.length > 0;
		return pickBy( suggestions, hasValues );
	},

	narrowDown: function( input ) {

		let [ taxonomy, filter ] = input.split(":");
		if( taxonomy === '' ){
			// empty string or just ":" or ":filter" -
			// TODO: just show welcome screen
			return {}
		}

		let terms; //terms that we will use to create suggestions

		if( filter !== undefined ) {
			// this means that we have at least taxonomy:
			// so check if this is a correct taxonomy
			if( this.props.terms.hasOwnProperty( taxonomy ) ) {
				//so we will only filter elements from this taxonomy
				terms = pick( this.props.terms, taxonomy );
			} else {
				// not a valid taxonomy
				// TODO tell something to the user
				return {};
			}
		} else {
			// we just have one word so treat is as a search terms
			filter = taxonomy;
			terms = this.props.terms;
		}

		const filtered = {};

		// store filtering term for highlithing
		this.setState( { filterTerm: filter } );

		for( const key in terms ) {
			if( ! this.props.terms.hasOwnProperty( key ) ) {
				continue;
			}

			filtered[ key ] = terms[ key ].filter(
				term => term.indexOf( filter ) !== -1
			);
		}

		const suggestions = this.removeEmptySuggestions( filtered );
		this.setState( { taxonomySuggestionsArray: this.createTaxonomySuggestionsArray( suggestions ) } );
		return suggestions;
	},

	createTaxonomySuggestionsArray: function( suggestions ) {
		const taxonomySuggestionsArray = [];

		for( const key in suggestions ) {
			if( ! suggestions.hasOwnProperty( key ) ) {
				continue;
			}
			taxonomySuggestionsArray.push( ... suggestions[ key ].map( value => key + ":" + value ) );
		}

		return taxonomySuggestionsArray;
	},

	createTextWithHighlight: function( text, highlighed_text ) {
		const re = new RegExp( "(" + highlighed_text + ")", "g" );
		const parts = text.split( re );
		const token = parts.map( part => {
			if( part === highlighed_text ) {
				return <span className="suggestions__value-emphasis" >{ part }</span>
			} else {
				return <span className="suggestions__value-normal" >{ part }</span>
			}
		} );

		return token;
	},

	createSuggestions: function( suggestions ) {
		let noOfSuggestions = 0;
		const rendered = []

		for( const key in suggestions ) {
			if( ! suggestions.hasOwnProperty( key ) ) {
				continue;
			}

			//Add header
			rendered.push( <span className="suggestions__category">{ key }</span> )
			//Add values
			rendered.concat( suggestions[ key ].map(
				( value, i ) => {
					const hashighlight =  ( noOfSuggestions + i ) === this.state.suggestionPosition;
					const className = "suggestions__value" + ( hashighlight ? " has-highlight" : "" );
					return rendered.push(
					 	<span className={ className } onMouseDown={ this.onMouseDown }>
							<span className="suggestions__value-cathegory">{ key + ":" }</span>
							{ this.createTextWithHighlight( value, this.state.filterTerm ) }
						</span>
					)
				}
			) );

			noOfSuggestions += suggestions[ key ].length;
		}

		return <div className="suggestions__suggestions">{ rendered }</div>;
	},

	render() {
		let suggestion;
		if( this.props.input === "" ){
			suggestion = this.props.welcomeSign();
		} else {
			suggestion = this.createSuggestions( this.state.suggestions );
		}

		return (
			<div className="suggestions"> {suggestion } </div>
		);
	}

} );

module.exports = Suggestions;

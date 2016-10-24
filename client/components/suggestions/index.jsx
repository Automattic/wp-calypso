/**
 * External dependencies
 */
import React from 'react';
import {
	noop,
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
			suggestions: {}
		}
	},

	getInitialState: function() {
		return {
			noOfSuggestions: 0,
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
			noOfSuggestions: this.countSuggestions( suggestions ),
			currentSuggestion: "",
		} );
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( nextProps.input !== this.props.input ) {
			const suggestions = this.narrowDown( nextProps.input )
			this.setState( {
				suggestions: suggestions,
				noOfSuggestions: this.countSuggestions( suggestions ),
				suggestionPosition: -1,
				currentSuggestion: "",
			} );
		}
	},

	countSuggestions: function( suggestions ) {
		let noOfSuggestions = 0;
		for( const key in suggestions ) {
			if( ! suggestions.hasOwnProperty( key ) ) {
				continue;
			}
			noOfSuggestions += suggestions[ key ].length;
		}
		return noOfSuggestions;
	},

	getSuggestionForPosition: function( position ) {
		let suggestionIndex = 0;
		for( const key in this.state.suggestions ) {
			suggestionIndex += this.state.suggestions[ key ].length;
			if( position <= suggestionIndex ) {
				return key + ":" + this.state.suggestions[ key ][ this.state.suggestions[ key ].length - ( suggestionIndex - position ) ];
			}
		}
	},

	incPosition: function() {
		const position = ( this.state.suggestionPosition + 1 ) % this.state.noOfSuggestions;
		this.setState( {
			suggestionPosition: position,
			currentSuggestion: this.getSuggestionForPosition( position ),
		} );
	},

	decPosition: function() {
		const position = ( this.state.suggestionPosition - 1 ) % this.state.noOfSuggestions;
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
		const filtered = {};

		for( const key in this.props.terms ) {
			if( ! this.props.terms.hasOwnProperty( key ) ) {
				continue;
			}

			filtered[ key ] = this.props.terms[ key ].filter(
				term => term.indexOf( input ) !== -1
			);
		}

		return this.removeEmptySuggestions( filtered );
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
							{ this.createTextWithHighlight( value, this.props.input ) }
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

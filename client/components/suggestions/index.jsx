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
			input: ""
		}
	},

	componentDidMount: function() {
	},

	componentDidUpdate: function() {
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

	createSuggestions: function() {
		const suggestions = this.narrowDown( this.props.input );
		const rendered = []

		for( const key in suggestions ) {
			if( ! suggestions.hasOwnProperty( key ) ) {
				continue;
			}

			//Add header
			rendered.push( <span className="suggestions__category">{ key }</span> )
			//Add values
			rendered.concat( suggestions[ key ].map(
				value => rendered.push( <span className="suggestions__value">
					<span className="suggestions__value-cathegory">{ key + ":" }</span>
					{ this.createTextWithHighlight( value, this.props.input ) }
				</span> )
			) );
		}

		return <div className="suggestions__suggestions">{ rendered }</div>;
	},

	render() {
		let suggestion;
		if( this.props.input === "" ){
			suggestion = this.props.welcomeSign();
		} else {
			suggestion = this.createSuggestions();
		}

		return (
			<div className="suggestions"> {suggestion } </div>
		);
	}

} );

module.exports = Suggestions;

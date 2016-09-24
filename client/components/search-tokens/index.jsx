/**
 * External dependencies
 */
const React = require( 'react' );

/**
 * Internal dependencies
 */

const SearchTokens = React.createClass( {

	propTypes: {
	},

	getInitialState() {
		return {
			input: "",
			tokens: null
		};
	},

	generateTokens( input ) {
		const tokens = input.split(/(\s+)/);

		return (
			<div className="search-tokens__tokens">
				{
					tokens.map( token => {
						if ( token.trim() === '' ) {
							return <span className="search-tokens__white-space">{ token }</span>;
						} else {
							return <span className="search-tokens__token">{ token }</span>;
						}
					} )
				}
			</div>
		);
	},

	onChange( event ) {
		this.setState( { input: event.target.value } );
		const tokens = this.generateTokens( event.target.value );
		this.setState( { tokens: tokens } );
	},

//Maybe background has impact on on text rendering.
//render text in span. and overlay stylinf in before.

	render() {
		return (
			<div	className="search-tokens">
				<input
					type="text"
					onChange={ this.onChange }
					className="search-tokens__input"
				/>
				{ this.state.tokens }
			</div>
		);
	}

} );

module.exports = SearchTokens;

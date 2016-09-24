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
		};
	},


	scrollOverlay: function() {
	  const _this = this;
	  window.requestAnimationFrame(function() {
			console.log( 'init_tokens: ' + _this.refs.tokens.scrollLeft );
			console.log( 'init_input: ' + _this.refs.inputField.scrollLeft );
			_this.refs.tokens.scrollLeft = _this.refs.inputField.scrollLeft;
			_this.refs.inputField.scrollLeft = _this.refs.tokens.scrollLeft;
			console.log( 'after_tokens: ' + _this.refs.tokens.scrollLeft );
			console.log( 'after_input: ' + _this.refs.inputField.scrollLeft );
		} );
	},

	componentDidUpdate: function() {
	  this.scrollOverlay();
	},

	onChange( event ) {
		this.setState( { input: event.target.value } );
	},

//Maybe background has impact on on text rendering.
//render text in span. and overlay stylinf in before.

	render() {
		const tokens = this.state.input.split(/(\s+)/);

		return (
			<div	className="search-tokens">
				<input
					type="text"
					ref="inputField"
					onChange={ this.onChange }
					className="search-tokens__input"
				/>
				<div className="search-tokens__tokens" ref="tokens">
					{
						tokens.map( ( token, i ) => {
							const cls = token.trim() === ''
							? "search-tokens__white-space"
							: "search-tokens__token";
								return <span className={ cls } key={ i }>{ token }</span>; // use shortid for key
						} )
					}
				</div>
			</div>
		);
	}

} );

module.exports = SearchTokens;

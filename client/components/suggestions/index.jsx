/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';

const Suggestions = React.createClass( {

	propTypes: {
		terms: React.PropTypes.object,
		input: React.PropTypes.string
	},

	componentDidMount: function() {
	},

	componentDidUpdate: function() {
	},

	renderWelcomeSign: function() {
		const taxonomies = Object.keys( this.props.terms );

		return (
			taxonomies.map( ( taxonomy, i ) => {
				return <span className="suggestions__taxonomy" key={ i }>{ taxonomy }</span>;
			} )
		);
	},

	render() {
		let suggestion;
		if( this.props.input === "" ){
			suggestion = this.renderWelcomeSign();
		}

		return (
			<div className="suggestions">
				<Card >
					<div>{ suggestion }</div>
				</Card>
			</div>
			);
	}

} );

module.exports = Suggestions;

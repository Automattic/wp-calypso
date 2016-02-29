/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

export default React.createClass( {

	displayName: 'JetpackLogo',

	mixins: [ PureRenderMixin ],

	getDefaultProps() {
		return {
			size: 72
		};
	},

	propTypes: {
		size: React.PropTypes.number
	},

	render() {
		return (
			<svg className="jetpack-logo" height={ this.props.size } width={ this.props.size } viewBox="0 0 18 18">
				<path d="M13.0046359,9.25823605 L9.48604166,15.3539915 L9.48604166,6.8984007 L12.313015,7.61796343 C13.0301435,7.80052635 13.3746179,8.61738309 13.0046359,9.25823605 L13.0046359,9.25823605 Z M8.64939166,11.1015993 L5.82241837,10.3820366 C5.10528979,10.1994736 4.76081543,9.38261691 5.13079742,8.74176395 L8.64939166,2.6460085 L8.64939166,11.1015993 Z M9.00006073,0 C4.02947547,0 0,4.0293812 0,9 C0,13.9706188 4.02947547,18 9.00006073,18 C13.9705245,18 18,13.9706188 18,9 C18,4.0293812 13.9705245,0 9.00006073,0 L9.00006073,0 Z"></path>
			</svg>
		);
	}
} );

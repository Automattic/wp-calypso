/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

export default React.createClass( {

	displayName: 'Count',

	mixins: [ PureRenderMixin ],

	propTypes: {
		count: React.PropTypes.number.isRequired,
	},

	render() {
		return (
			<span className="count">{ this.numberFormat( this.props.count ) }</span>
		);
	}
} );

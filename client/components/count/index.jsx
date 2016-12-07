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
		const { count, ...inheritProps } = this.props;
		return (
			<span className="count" { ...inheritProps }>{ this.numberFormat( count ) }</span>
		);
	}
} );

/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import { omit } from 'lodash';

export default React.createClass( {

	displayName: 'Count',

	mixins: [ PureRenderMixin ],

	propTypes: {
		count: React.PropTypes.number.isRequired,
	},

	render() {
		const inheritProps = omit( this.props, [ 'count' ] );
		return (
			<span className="count" { ...inheritProps }>{ this.numberFormat( this.props.count ) }</span>
		);
	}
} );

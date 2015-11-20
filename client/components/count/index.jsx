/**
 * External dependencies
 */
import React from 'react/addons';

export default React.createClass( {

	displayName: 'Count',

	mixins: [ React.addons.PureRenderMixin ],

	propTypes: {
		count: React.PropTypes.number.isRequired,
	},

	render() {
		return (
			<span className="count">{ this.numberFormat( this.props.count ) }</span>
		);
	}
} );

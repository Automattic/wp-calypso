/**
 * External dependencies
 */
import classNames from 'classnames';
import omit from 'lodash/object/omit';
import React from 'react';

const Flag = React.createClass( {
	propTypes: {
		icon: React.PropTypes.string.isRequired,
		type: React.PropTypes.string.isRequired,
		className: React.PropTypes.string
	},

	render() {
		const props = omit( this.props, [ 'icon', 'type', 'className' ] );

		return (
			<label
				{ ...props }
				className={ classNames( 'flag', this.props.type, this.props.className ) }>
				<span className={ classNames( 'noticon', this.props.icon ) }></span>
				{ this.props.children }
			</label>
		);
	}
} );

module.exports = Flag;

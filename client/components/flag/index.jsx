/**
 * External dependencies
 */
import classNames from 'classnames';
import omit from 'lodash/object/omit';
import React from 'react';

const Flag = React.createClass( {
	propTypes: {
		icon: React.PropTypes.string,
		type: React.PropTypes.string.isRequired,
		className: React.PropTypes.string
	},

	render() {
		const props = omit( this.props, [ 'icon', 'type', 'className' ] );

		let noticon;
		if ( this.props.icon ) {
			noticon = <span className={ classNames( 'noticon', this.props.icon ) }></span>
		}

		return (
			<label
				{ ...props }
				className={ classNames( 'flag', this.props.type, this.props.className ) }>
				{ noticon }
				{ this.props.children }
			</label>
		);
	}
} );

module.exports = Flag;

/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import assign from 'lodash/object/assign';
import noop from 'lodash/utility/noop';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';

export default React.createClass( {

	displayName: 'AddNewButton',

	getDefaultProps() {
		return {
			isCompact: false,
			onClick: noop,
			outline: false,
			icon: null,
		};
	},

	propTypes: {
		className: React.PropTypes.string,
		href: React.PropTypes.string,
		icon: React.PropTypes.string,
		isCompact: React.PropTypes.bool,
		onClick: React.PropTypes.func,
		outline: React.PropTypes.bool
	},

	render() {
		// this component creates an anchor or a button
		// depending on which props are passed
		const element = this.props.href ? 'a' : 'button';

		const classes = classnames( 'add-new-button', this.props.className, {
			'is-compact': this.props.isCompact,
			'has-icon': !! this.props.icon,
		} );

		const defaultIcon = ( this.props.outline ? 'add-outline' : 'add' );
		const icon = this.props.icon ? this.props.icon : defaultIcon;
		const firstIcon = this.props.icon ? <Gridicon key="plus-icon" icon="plus-small" size={ 12 } /> : null;

		return React.createElement(
			element,
			assign( {}, this.props, { className: classes } ),
			[ firstIcon, <Gridicon key="object-icon" className="gridicon__icon" icon={ icon } size={ 18 } /> ],
			<span className="add-new-button__text">{ this.props.children }</span>
		);
	}
} );

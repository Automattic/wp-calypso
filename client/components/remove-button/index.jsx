/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import noop from 'lodash/utility/noop';
import Gridicon from 'components/gridicon';

export default React.createClass( {

	displayName: 'RemoveButton',

	propTypes: {
		icon: React.PropTypes.string,
		disabled: React.PropTypes.bool,
		onClick: React.PropTypes.func
	},

	getDefaultProps() {
		return {
			icon: 'remove',
			disabled: false,
			compact: false,
			scary: false,
			onClick: noop
		};
	},

	render() {
		const buttonIcons = {
			remove: 'cross',
			trash: 'trash',
			disconnect: 'link-break',
			deactivate: 'cross',
			delete: 'trash',
		};
		const buttonClasses = classNames( this.props.className, {
			'button-remove': true,
			'is-compact': this.props.compact,
			'is-scary': this.props.scary
		} );

		return(
			<button onClick={ this.props.onClick } disabled={ this.props.disabled } className={ buttonClasses }>
				<Gridicon icon={ buttonIcons[this.props.icon] } size={ this.props.compact ? 12 : 24 } />
				{ this.props.children }
			</button>
		);
	}
} );

/**
 * External dependencies
 */
import React from 'react';
import assign from 'lodash/object/assign';
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

	getIconAssignments(){

	},

	render() {
		const element = 'button';
		const buttonIcons = {
			'remove': 		'cross',
			'trash': 			'trash',
			'disconnect':	'link-break',
			'deactivate':	'cross',
			'delete':			'trash',
		};
		const buttonClasses = classNames( {
			'button-remove': true,
			'is-compact': this.props.compact,
			'is-scary': this.props.scary
		} );

		if( this.props.compact ){
			var iconSize = 12;
		} else {
			var iconSize = 24;
		}

		return(
			<button onClick={ this.props.onClick } disabled={ this.props.disabled } className={ classNames( this.props.className, buttonClasses ) }>
				<Gridicon icon={ buttonIcons[ this.props.icon ] } size={ iconSize } />
				{ this.props.children }
			</button>
		);
	}
} );

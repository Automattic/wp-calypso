/**
 * External dependencies
 */

import React, { PureComponent } from 'react';
import classNames from 'classnames';

/**
 * Style dependencies
 */
import './style.scss';

class ButtonGroup extends PureComponent {
	static propTypes = {
		children( props ) {
			let error = null;
			React.Children.forEach( props.children, ( child ) => {
				if ( child && ( ! child.props || child.props.type !== 'button' ) ) {
					error = new Error( 'All children elements should be a Button.' );
				}
			} );
			return error;
		},
	};

	render() {
		const buttonGroupClasses = classNames( 'button-group', this.props.className, {
			'is-busy': this.props.busy,
			'is-primary': this.props.primary,
		} );

		return <span className={ buttonGroupClasses }>{ this.props.children }</span>;
	}
}

export default ButtonGroup;

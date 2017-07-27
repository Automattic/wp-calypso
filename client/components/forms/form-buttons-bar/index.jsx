/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { omit } from 'lodash';

export default class extends React.Component {
	static displayName = 'FormButtonsBar';

	render() {
		return (
			<div
				{ ...omit( this.props, 'className' ) }
				className={ classnames( this.props.className, 'form-buttons-bar' ) }
			>
				{ this.props.children }
			</div>
		);
	}
}

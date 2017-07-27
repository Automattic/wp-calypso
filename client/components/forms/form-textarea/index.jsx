/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { omit } from 'lodash';

export default class extends React.Component {
    static displayName = 'FormTextarea';

	render() {
		return (
			<textarea { ...omit( this.props, 'className' ) } className={ classnames( this.props.className, 'form-textarea' ) } >
				{ this.props.children }
			</textarea>
		);
	}
}

/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { omit } from 'lodash';

export default class extends React.Component {
    static displayName = 'FormFieldset';

	render() {
		return (
			<fieldset { ...omit( this.props, 'className' ) } className={ classnames( this.props.className, 'form-fieldset' ) } >
				{ this.props.children }
			</fieldset>
		);
	}
}

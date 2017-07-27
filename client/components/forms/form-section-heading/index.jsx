/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { omit } from 'lodash';

export default class extends React.Component {
	static displayName = 'FormSectionHeading';

	render() {
		return (
			<h3
				{ ...omit( this.props, 'className' ) }
				className={ classnames( this.props.className, 'form-section-heading' ) }
			>
				{ this.props.children }
			</h3>
		);
	}
}

/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { omit } from 'lodash';

export default class extends React.Component {
    static displayName = 'FormLegend';

	render() {
		return (
			<legend { ...omit( this.props, 'className' ) } className={ classnames( this.props.className, 'form-legend' ) } >
				{ this.props.children }
			</legend>
		);
	}
}

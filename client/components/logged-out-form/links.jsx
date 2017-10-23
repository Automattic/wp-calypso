/**
 * External dependencies
 *
 * @format
 */

import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';
import { omit } from 'lodash';

export default class extends React.Component {
	static displayName = 'LoggedOutFormLinks';

	static propTypes = {
		children: PropTypes.node.isRequired,
		className: PropTypes.string,
	};

	render() {
		return (
			<div
				{ ...omit( this.props, 'classNames' ) }
				className={ classnames( 'logged-out-form__links', this.props.className ) }
			>
				{ this.props.children }
			</div>
		);
	}
}

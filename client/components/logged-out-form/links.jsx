import clsx from 'clsx';
import { omit } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';

import './links.scss';

export default class LoggedOutFormLinks extends Component {
	static propTypes = {
		children: PropTypes.node.isRequired,
		className: PropTypes.string,
	};

	render() {
		return (
			<div
				{ ...omit( this.props, 'classNames' ) }
				className={ clsx( 'logged-out-form__links', this.props.className ) }
			>
				{ this.props.children }
			</div>
		);
	}
}

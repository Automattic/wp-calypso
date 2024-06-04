import { Card } from '@automattic/components';
import clsx from 'clsx';
import { omit } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';

import './style.scss';

export default class LoggedOutForm extends Component {
	static propTypes = {
		children: PropTypes.node.isRequired,
		className: PropTypes.string,
	};

	render() {
		return (
			<Card className={ clsx( 'logged-out-form', this.props.className ) }>
				<form { ...omit( this.props, 'className' ) }>{ this.props.children }</form>
			</Card>
		);
	}
}

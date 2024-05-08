import { Card } from '@automattic/components';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Component } from 'react';

import './footer.scss';

class LoggedOutFormFooter extends Component {
	static propTypes = {
		children: PropTypes.node.isRequired,
		className: PropTypes.string,
		isBlended: PropTypes.bool,
	};

	render() {
		return (
			<Card
				className={ clsx( 'logged-out-form__footer', this.props.className, {
					'is-blended': this.props.isBlended,
				} ) }
			>
				{ this.props.children }
			</Card>
		);
	}
}

export default LoggedOutFormFooter;

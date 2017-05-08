/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Card from 'components/card';

class LoggedOutFormFooter extends Component {
	static propTypes = {
		children: PropTypes.node.isRequired,
		className: PropTypes.string,
		isBlended: PropTypes.bool
	};

	render() {
		return (
			<Card className={ classnames( 'logged-out-form__footer', this.props.className, { 'is-blended': this.props.isBlended } ) } >
				{ this.props.children }
			</Card>
		);
	}
}

export default LoggedOutFormFooter;

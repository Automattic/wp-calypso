/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Style dependencies
 */
import './style.scss';

export default class extends React.Component {
	static displayName = 'FormInputValidation';

	static propTypes = {
		isError: PropTypes.bool,
		isWarning: PropTypes.bool,
		text: PropTypes.node,
		icon: PropTypes.string,
		id: PropTypes.string,
	};

	static defaultProps = { isError: false, id: null };

	render() {
		const classes = classNames( this.props.className, {
			'form-input-validation': true,
			'is-warning': this.props.isWarning,
			'is-error': this.props.isError,
			'is-hidden': this.props.isHidden,
		} );

		const icon = this.props.isError || this.props.isWarning ? 'notice-outline' : 'checkmark';

		return (
			<div className={ classes } role="alert">
				<span id={ this.props.id }>
					<Gridicon size={ 24 } icon={ this.props.icon ? this.props.icon : icon } />{' '}
					{ this.props.text }
				</span>
			</div>
		);
	}
}

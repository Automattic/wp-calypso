/**
 * External dependencies
 */
import classNames from 'classnames';
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';
import React from 'react';

export default class extends React.Component {
	static displayName = 'FormInputValidation';

	static propTypes = {
		isError: PropTypes.bool,
		isWarning: PropTypes.bool,
		text: PropTypes.node,
		icon: PropTypes.string,
	};

	static defaultProps = { isError: false };

	render() {
		const classes = classNames( {
			'form-input-validation': true,
			'is-warning': this.props.isWarning,
			'is-error': this.props.isError,
		} );

		const icon = this.props.isError || this.props.isWarning ? 'notice-outline' : 'checkmark';

		return (
			<div className={ classes }>
				<span>
					<Gridicon size={ 24 } icon={ this.props.icon ? this.props.icon : icon } />{' '}
					{ this.props.text }
				</span>
			</div>
		);
	}
}

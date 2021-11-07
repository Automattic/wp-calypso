import { Gridicon } from '@automattic/components';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { Component } from 'react';

import './style.scss';

export default class extends Component {
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
					<Gridicon size={ 24 } icon={ this.props.icon ? this.props.icon : icon } />{ ' ' }
					{ this.props.text }
					{ this.props.children }
				</span>
			</div>
		);
	}
}

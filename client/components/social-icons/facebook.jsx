/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { omit } from 'lodash';

/**
 * Style dependencies
 */
import './style.scss';

export default class FacebookIcon extends PureComponent {
	static propTypes = {
		isDisabled: PropTypes.bool,
	};

	static defaultProps = {
		isDisabled: false,
	};

	render() {
		const props = omit( this.props, [ 'isDisabled' ] );

		return (
			<svg
				className={ classNames( 'social-icons social-icons__facebook', {
					'social-icons--enabled': ! this.props.isDisabled,
					'social-icons--disabled': !! this.props.isDisabled,
				} ) }
				width="20"
				height="20"
				viewBox="0 0 20 20"
				xmlns="http://www.w3.org/2000/svg"
				{ ...props }
			>
				<path
					d="M18.86.041H1.14a1.1 1.1 0 0 0-1.099 1.1v17.718a1.1 1.1 0 0 0 1.1 1.1h9.539v-7.713H8.084V9.24h2.596V7.023c0-2.573 1.571-3.973 3.866-3.973 1.1 0 2.044.081 2.32.118v2.688l-1.592.001c-1.248 0-1.49.593-1.49 1.463v1.92h2.977l-.388 3.006h-2.59v7.713h5.076a1.1 1.1 0 0 0 1.1-1.1V1.14a1.1 1.1 0 0 0-1.1-1.099"
					fill="#3E68B5"
					fillRule="evenodd"
				/>
			</svg>
		);
	}
}

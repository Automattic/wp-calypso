/**
 * Source: https://github.com/Automattic/wp-calypso/blob/HEAD/client/components/spinner/index.jsx
 */

import classNames from 'classnames';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';

export default class Spinner extends PureComponent {
	static propTypes = {
		className: PropTypes.string,
		size: PropTypes.number,
	};

	static defaultProps = {
		size: 20,
	};

	render() {
		const className = classNames( 'wpnc__spinner', this.props.className );

		const style = {
			width: this.props.size,
			height: this.props.size,
			fontSize: this.props.size, // allows border-width to be specified in em units
		};

		return (
			<div className={ className }>
				<div className="wpnc__spinner__outer" style={ style }>
					<div className="wpnc__spinner__inner" />
				</div>
			</div>
		);
	}
}

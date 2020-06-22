/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import Gridicon from 'components/gridicon';

/**
 * Style dependencies
 */
import './style.scss';

export default class DomainNotice extends React.Component {
	static propTypes = {
		text: PropTypes.string,
		status: PropTypes.oneOf( [ 'info', 'warning', 'alert' ] ),
	};

	static defaultProps = {
		status: 'info',
	};

	render() {
		const { status, text } = this.props;

		const className = `domain-notice domain-notice__${ status }`;
		const icon = status === 'info' ? 'time' : 'notice-outline';

		return (
			<span className={ className }>
				<Gridicon icon={ icon } size={ 18 } />
				{ text }
			</span>
		);
	}
}

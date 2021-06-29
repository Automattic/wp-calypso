/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import Gridicon from 'calypso/components/gridicon';
import classnames from 'classnames';

/**
 * Style dependencies
 */
import './style.scss';

export default class DomainNotice extends React.Component {
	static propTypes = {
		text: PropTypes.string,
		status: PropTypes.oneOf( [ 'success', 'info', 'warning', 'alert' ] ),
		className: PropTypes.string,
	};

	static defaultProps = {
		status: 'info',
	};

	render() {
		const { status, text, className } = this.props;

		const classes = classnames( 'domain-notice', `domain-notice__${ status }`, className );
		let icon = 'notice-outline';
		if ( 'info' === status ) {
			icon = 'time';
		}
		if ( 'success' === status ) {
			icon = 'checkmark';
		}

		return (
			<span className={ classes }>
				<Gridicon icon={ icon } size={ 18 } />
				{ text }
			</span>
		);
	}
}

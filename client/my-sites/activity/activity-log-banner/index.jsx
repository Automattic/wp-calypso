/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { Card, ScreenReaderText } from '@automattic/components';
import Gridicon from 'calypso/components/gridicon';

/**
 * Style dependencies
 */
import './style.scss';

class ActivityLogBanner extends Component {
	static propTypes = {
		icon: PropTypes.string,
		isDismissable: PropTypes.bool.isRequired,
		onDismissClick: PropTypes.func,
		status: PropTypes.oneOf( [ 'error', 'info', 'success', 'warning' ] ),
		title: PropTypes.node.isRequired,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		isDismissable: false,
		onDismissClick: noop,
		status: null,
		title: '',
	};

	getIcon() {
		// Allow an icon prop to override auto-icon (even null!)
		const { icon } = this.props;
		if ( typeof icon !== 'undefined' ) {
			return icon;
		}

		switch ( this.props.status ) {
			case 'error':
			case 'warning':
				return 'notice-outline';

			case 'info':
				return 'info-outline';

			case 'success':
				return 'star';
		}

		return null;
	}

	render() {
		const { isDismissable, onDismissClick, children, title, translate, status } = this.props;

		const icon = this.getIcon();

		return (
			<Card className="activity-log-banner" highlight={ status }>
				{ icon && (
					<div className="activity-log-banner__icon">
						<Gridicon icon={ icon } size={ 24 } />
					</div>
				) }
				<div className="activity-log-banner__content">
					{ title && <h2 className="activity-log-banner__title">{ title }</h2> }
					{ children && <div className="activity-log-banner__body">{ children }</div> }
				</div>
				{ isDismissable && (
					<button className="activity-log-banner__dismiss" onClick={ onDismissClick } type="button">
						<ScreenReaderText>{ translate( 'Dismiss' ) }</ScreenReaderText>
						<Gridicon icon="cross" size={ 24 } />
					</button>
				) }
			</Card>
		);
	}
}

export default localize( ActivityLogBanner );

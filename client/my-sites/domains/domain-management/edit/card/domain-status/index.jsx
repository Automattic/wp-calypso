/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import MaterialIcon from 'components/material-icon';
import { Card } from '@automattic/components';

class DomainStatus extends React.Component {
	static propTypes = {
		header: PropTypes.string,
		icon: PropTypes.string,
		statusText: PropTypes.string,
		statusClass: PropTypes.string,
		children: PropTypes.any,
	};

	getBreakPoint( headerLength, breakPoints ) {
		for ( const breakPoint of breakPoints ) {
			if ( headerLength > breakPoint[ 0 ] ) {
				return breakPoint[ 1 ];
			}
		}
	}

	render() {
		const { header, icon, statusText, statusClass, children } = this.props;

		const cardClasses = classNames( 'domain-status__card', statusClass );

		const desktopBreakpoints = [
			[ 60, 'xxl' ],
			[ 51, 'xl' ],
			[ 45, 'l' ],
			[ 39, 'm' ],
			[ 0, 's' ],
		];
		const mobileBreakpoints = [
			[ 37, 'xxl' ],
			[ 31, 'xl' ],
			[ 26, 'l' ],
			[ 22, 'm' ],
			[ 0, 's' ],
		];

		const headerClasses = classNames(
			'mobile-' + this.getBreakPoint( header.length, mobileBreakpoints ),
			'desktop-' + this.getBreakPoint( header.length, desktopBreakpoints )
		);

		return (
			<Card compact={ true } className={ cardClasses }>
				<h2 className={ headerClasses }>{ header }</h2>
				<div className="domain-status__icon">
					<MaterialIcon icon={ icon } /> { statusText }
				</div>
				{ children }
			</Card>
		);
	}
}

export default DomainStatus;

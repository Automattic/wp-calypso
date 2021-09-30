import { Card, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { Component } from 'react';
import PremiumBadge from 'calypso/components/domains/premium-badge';
import MaterialIcon from 'calypso/components/material-icon';

class DomainStatus extends Component {
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
		const { header, icon, statusText, statusClass, premium, children } = this.props;

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
				<h2 className={ headerClasses }>
					<a target="_blank" rel="noopener noreferrer" href={ 'http://' + header }>
						<span>{ header }</span>
						<Gridicon icon="external" size={ 18 } />
					</a>
				</h2>
				<div className="domain-status__icon">
					{ premium && <PremiumBadge /> } <MaterialIcon icon={ icon } /> { statusText }
				</div>
				{ children }
			</Card>
		);
	}
}

export default DomainStatus;

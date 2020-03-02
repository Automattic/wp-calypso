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

	getHeaderFontSize( header ) {
		const headerLength = header.length;

		if ( headerLength > 60 ) {
			return 16;
		}
		if ( headerLength > 51 ) {
			return 20;
		}
		if ( headerLength > 45 ) {
			return 24;
		}
		if ( headerLength > 39 ) {
			return 28;
		}
		return 32;
	}

	render() {
		const { header, icon, statusText, statusClass, children } = this.props;

		const cardClasses = classNames( 'domain-status__card', statusClass );

		return (
			<Card compact={ true } className={ cardClasses }>
				<h2 className={ `font-size-${ this.getHeaderFontSize( header ) }` }>{ header }</h2>
				<div className="domain-status__icon">
					<MaterialIcon icon={ icon } /> { statusText }
				</div>
				{ children }
			</Card>
		);
	}
}

export default DomainStatus;

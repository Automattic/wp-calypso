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

	render() {
		const { header, icon, statusText, statusClass, children } = this.props;

		const cardClasses = classNames( 'domain-status__card', statusClass );

		return (
			<Card compact={ true } className={ cardClasses }>
				<h2>{ header }</h2>
				<div className="domain-status__icon">
					<MaterialIcon icon={ icon } /> { statusText }
				</div>
				{ children }
			</Card>
		);
	}
}

export default DomainStatus;

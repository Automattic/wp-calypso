/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import SectionHeader from 'components/section-header';

class OrderActivityLog extends Component {
	render() {
		const { order, translate } = this.props;
		if ( ! order ) {
			return null;
		}

		return (
			<div className="order__activity-log">
				<SectionHeader label={ translate( 'Activity Log' ) } />
				<Card></Card>
			</div>
		);
	}
}

export default localize( OrderActivityLog );

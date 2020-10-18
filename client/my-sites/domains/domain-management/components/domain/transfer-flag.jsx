/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import { type as domainTypes, transferStatus } from 'calypso/lib/domains/constants';
import { localize } from 'i18n-calypso';
import Notice from 'calypso/components/notice';

class DomainTransferFlag extends PureComponent {
	static propTypes = {
		domain: PropTypes.object.isRequired,
		translate: PropTypes.func.isRequired,
	};

	render() {
		const { domain, translate } = this.props;

		if ( domain.type !== domainTypes.TRANSFER ) {
			return null;
		}

		let status = 'is-warning';
		let message = translate( 'Transfer in Progress' );

		switch ( domain.transferStatus ) {
			case transferStatus.PENDING_OWNER:
				message = translate( 'Email Confirmation Required' );
				break;
			case transferStatus.PENDING_START:
				message = translate( 'Action Required' );
				break;
			case transferStatus.CANCELLED:
				status = 'is-error';
				message = translate( 'Transfer Failed' );
				break;
		}

		return (
			<Notice isCompact status={ status }>
				{ message }
			</Notice>
		);
	}
}

export default localize( DomainTransferFlag );

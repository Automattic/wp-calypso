/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';

/**
 * Style dependencies
 */
import './style.scss';

class ListHeader extends React.PureComponent {
	render() {
		const { translate } = this.props;

		const linkColumnClass = 'domain-item__link';
		const transferLockClass = 'domain-item__transfer-lock';
		const privacyClass = 'domain-item__privacy';
		const autoRenewClass = 'domain-item__auto-renew';
		const emailClass = 'domain-item__email';
		const optionsClass = 'domain-item__options';

		return (
			<CompactCard className="list-header">
				<div className={ linkColumnClass } />
				<div className={ transferLockClass }>{ translate( 'Transfer lock' ) }</div>
				<div className={ privacyClass }>{ translate( 'Privacy' ) }</div>
				<div className={ autoRenewClass }>{ translate( 'Auto-renew' ) }</div>
				<div className={ emailClass }>{ translate( 'Email' ) }</div>
				<div className={ optionsClass }>{ translate( 'Options' ) }</div>
			</CompactCard>
		);
	}
}

export default localize( ListHeader );

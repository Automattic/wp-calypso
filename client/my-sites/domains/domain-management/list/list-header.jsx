/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import InfoPopover from 'components/info-popover';

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
				<div className={ transferLockClass }>
					{ translate( 'Transfer lock' ) }
					<InfoPopover iconSize={ 18 }>
						{ translate(
							'When enabled, a transfer lock prevents your domain from being transferred to another ' +
								'provider. Sometimes, the transfer lock cannot be disabled, such as when a domain ' +
								'is recently registered.'
						) }
					</InfoPopover>
				</div>
				<div className={ privacyClass }>
					{ translate( 'Privacy' ) }
					<InfoPopover iconSize={ 18 }>
						{ translate(
							'Enabling domain privacy protection hides your contact information from public view. ' +
								'For some domain extensions, such as some country specific domain extensions, ' +
								'privacy protection is not available.'
						) }
					</InfoPopover>
				</div>
				<div className={ autoRenewClass }>
					{ translate( 'Auto-renew' ) }
					<InfoPopover iconSize={ 18 }>
						{ translate(
							'When auto-renew is enabled, we will automatically attempt to renew your domain 30 days ' +
								'before it expires, to ensure you do not lose access to your domain.'
						) }
					</InfoPopover>
				</div>
				<div className={ emailClass }>
					{ translate( 'Email' ) }
					<InfoPopover iconSize={ 18 }>
						{ translate(
							'You can receive email using your custom domain by using email forwarding or by ' +
								'purchasing a G Suite subscription. Note that email forwarding requires a plan ' +
								'subscription.'
						) }
					</InfoPopover>
				</div>
				<div className={ optionsClass }>{ translate( 'Options' ) }</div>
			</CompactCard>
		);
	}
}

export default localize( ListHeader );

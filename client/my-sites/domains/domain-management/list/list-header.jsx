/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

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
	static propTypes = {
		headerClasses: PropTypes.object,
	};

	render() {
		const { headerClasses, translate } = this.props;

		const listHeaderClasses = classNames( 'list-header', headerClasses );

		return (
			<CompactCard className={ listHeaderClasses }>
				<div className="list__domain-link" />
				<div className="list__domain-transfer-lock">
					{ translate( 'Transfer lock' ) }
					<InfoPopover iconSize={ 18 }>
						{ translate(
							'When enabled, a transfer lock prevents your domain from being transferred to another ' +
								'provider. Sometimes the transfer lock cannot be disabled, such as when a domain ' +
								'is recently registered.'
						) }
					</InfoPopover>
				</div>
				<div className="list__domain-privacy">
					{ translate( 'Privacy' ) }
					<InfoPopover iconSize={ 18 }>
						{ translate(
							'Enabling domain privacy protection hides your contact information from public view. ' +
								'For some domain extensions, such as some country specific domain extensions, ' +
								'privacy protection is not available.'
						) }
					</InfoPopover>
				</div>
				<div className="list__domain-auto-renew">
					{ translate( 'Auto-renew' ) }
					<InfoPopover iconSize={ 18 }>
						{ translate(
							'When auto-renew is enabled, we will automatically attempt to renew your domain 30 days ' +
								'before it expires, to ensure you do not lose access to your domain.'
						) }
					</InfoPopover>
				</div>
				<div className="list__domain-email">
					{ translate( 'Email' ) }
					<InfoPopover iconSize={ 18 }>
						{ translate(
							'You can receive email using your custom domain by using email forwarding or by ' +
								'purchasing a G Suite subscription. Note that email forwarding requires a plan ' +
								'subscription.'
						) }
					</InfoPopover>
				</div>
				<div className="list__domain-options"></div>
			</CompactCard>
		);
	}
}

export default localize( ListHeader );

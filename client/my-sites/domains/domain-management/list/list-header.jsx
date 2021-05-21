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
import InfoPopover from 'calypso/components/info-popover';
import { getGoogleMailServiceFamily } from 'calypso/lib/gsuite';
import { getTitanProductName } from 'calypso/lib/titan';

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
					<span>{ translate( 'Transfer lock' ) }</span>
					<InfoPopover iconSize={ 18 }>
						{ translate(
							'When enabled, a transfer lock prevents your domain from being transferred to another ' +
								'provider. Sometimes the transfer lock cannot be disabled, such as when a domain ' +
								'is recently registered.'
						) }
					</InfoPopover>
				</div>
				<div className="list__domain-privacy">
					<span>{ translate( 'Privacy' ) }</span>
					<InfoPopover iconSize={ 18 }>
						{ translate(
							'Enabling domain privacy protection hides your contact information from public view. ' +
								'For some domain extensions, such as some country specific domain extensions, ' +
								'privacy protection is not available.'
						) }
					</InfoPopover>
				</div>
				<div className="list__domain-auto-renew">
					<span>{ translate( 'Auto-renew' ) }</span>
					<InfoPopover iconSize={ 18 }>
						{ translate(
							'When auto-renew is enabled, we will automatically attempt to renew your domain 30 days ' +
								'before it expires, to ensure you do not lose access to your domain.'
						) }
					</InfoPopover>
				</div>
				<div className="list__domain-email">
					<span>{ translate( 'Email' ) }</span>
					<InfoPopover iconSize={ 18 }>
						{ translate(
							'You can receive email using your custom domain by purchasing %(titanMailService)s or %(googleMailService)s, or by ' +
								'setting up email forwarding. Note that email forwarding requires a plan subscription.',
							{
								args: {
									googleMailService: getGoogleMailServiceFamily(),
									titanMailService: getTitanProductName(),
								},
								comment:
									'%(googleMailService)s can be either "G Suite" or "Google Workspace"; %(titanMailService)s will be "Professional Email" translated',
							}
						) }
					</InfoPopover>
				</div>
				<div className="list__domain-options"></div>
			</CompactCard>
		);
	}
}

export default localize( ListHeader );

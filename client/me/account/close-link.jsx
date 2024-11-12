import { CompactCard } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { Component } from 'react';

import './close-link.scss';

const noop = () => {};

class AccountSettingsCloseLink extends Component {
	render() {
		const { translate } = this.props;
		const href = '/me/account/close';
		const onClick = noop;
		return (
			<CompactCard href={ href } onClick={ onClick } className="account__settings-close">
				<div>
					<p className="account__close-section-title is-warning">
						{ translate( 'Delete your account permanently' ) }
					</p>
					<p className="account__close-section-desc">
						{ translate( 'Delete all of your sites, and close your account completely.' ) }
					</p>
				</div>
			</CompactCard>
		);
	}
}

export default localize( AccountSettingsCloseLink );

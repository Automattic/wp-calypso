/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { CompactCard } from '@automattic/components';

/**
 * Internal dependencies
 */
import googleWorkspaceIcon from 'calypso/assets/images/email-providers/google-workspace/icon.svg';
import emailForwardingIcon from 'calypso/assets/images/email-providers/forwarding.svg';
import { getEmailForwardsCount, hasEmailForwards } from 'calypso/lib/domains/email-forwarding';
import { getGSuiteMailboxCount, hasGSuiteWithUs } from 'calypso/lib/gsuite';
import { getMaxTitanMailboxCount, hasTitanMailWithUs } from 'calypso/lib/titan';
import Gridicon from 'calypso/components/gridicon';
import SectionHeader from 'calypso/components/section-header';
import { emailManagement } from 'calypso/my-sites/email/paths';

class EmailListActive extends React.Component {
	getMailboxCount( domain ) {
		if ( hasTitanMailWithUs( domain ) ) {
			return getMaxTitanMailboxCount( domain );
		}

		if ( hasGSuiteWithUs( domain ) ) {
			return getGSuiteMailboxCount( domain );
		}

		if ( hasEmailForwards( domain ) ) {
			return getEmailForwardsCount( domain );
		}

		return 0;
	}

	getHeaderImage( domain ) {
		const { translate } = this.props;

		if ( hasTitanMailWithUs( domain ) ) {
			return <Gridicon icon="my-sites" size={ 36 } />;
		}

		if ( hasGSuiteWithUs( domain ) ) {
			return <img src={ googleWorkspaceIcon } alt={ translate( 'Google Workspace icon' ) } />;
		}

		if ( hasEmailForwards( domain ) ) {
			return <img src={ emailForwardingIcon } alt={ translate( 'Email Forwarding icon' ) } />;
		}

		return null;
	}

	render() {
		const { selectedSiteSlug, currentRoute, domains, translate } = this.props;

		if ( domains.length < 1 ) {
			return null;
		}

		const headerCard = <SectionHeader label={ translate( 'Active email plans' ) } />;

		const emailListItems = domains.map( ( domain ) => {
			return (
				<CompactCard
					href={ emailManagement( selectedSiteSlug, domain.name, currentRoute ) }
					key={ `${ domain.name }-row` }
				>
					<span className="email-list-active__item-icon">{ this.getHeaderImage( domain ) }</span>
					<div>
						<h2>@{ domain.name }</h2>
						<span>{ this.getMailboxCount( domain ) }</span>
					</div>
				</CompactCard>
			);
		} );

		return (
			<div className="email-list-active__items">
				{ headerCard }
				{ emailListItems }
			</div>
		);
	}
}

export default localize( EmailListActive );

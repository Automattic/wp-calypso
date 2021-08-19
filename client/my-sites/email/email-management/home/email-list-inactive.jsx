import { Button, Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import React from 'react';
import SectionHeader from 'calypso/components/section-header';
import { canCurrentUserAddEmail } from 'calypso/lib/domains';
import { emailManagementPurchaseNewEmailAccount } from 'calypso/my-sites/email/paths';

class EmailListInactive extends React.Component {
	render() {
		const { selectedSiteSlug, currentRoute, domains, translate } = this.props;

		if ( domains.length < 1 ) {
			return null;
		}

		const emailListItems = domains.map( ( domain ) => {
			return (
				<Card key={ domain.name }>
					<span>{ domain.name }</span>
					{ canCurrentUserAddEmail( domain ) && (
						<Button
							href={ emailManagementPurchaseNewEmailAccount(
								selectedSiteSlug,
								domain.name,
								currentRoute
							) }
						>
							{ translate( 'Add Email' ) }
						</Button>
					) }
				</Card>
			);
		} );

		return (
			<div className="email-list-inactive">
				<SectionHeader label={ translate( 'Other domains' ) } />
				{ emailListItems }
			</div>
		);
	}
}

export default localize( EmailListInactive );

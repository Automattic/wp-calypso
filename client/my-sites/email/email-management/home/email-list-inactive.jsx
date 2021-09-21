import { Button, Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import React from 'react';
import emailIllustration from 'calypso/assets/images/email-providers/email-illustration.svg';
import PromoCard from 'calypso/components/promo-section/promo-card';
import SectionHeader from 'calypso/components/section-header';
import { canCurrentUserAddEmail } from 'calypso/lib/domains';
import {
	emailManagementPurchaseNewEmailAccount,
	isUnderEmailManagementInbox,
} from 'calypso/my-sites/email/paths';

class EmailListInactive extends React.Component {
	getMainHeader() {
		const { translate } = this.props;
		const image = {
			path: emailIllustration,
			align: 'right',
		};

		return (
			<>
				<PromoCard title={ translate( 'Pick a domain to get started' ) } image={ image }>
					<p>
						{ translate(
							'Pick a domain from your available domains below to add an email solution.'
						) }
					</p>
				</PromoCard>
				<br />
			</>
		);
	}

	render() {
		const { selectedSiteSlug, currentRoute, domains, translate } = this.props;

		if ( domains.length < 1 ) {
			return null;
		}

		const sectionHeaderLabel = isUnderEmailManagementInbox( currentRoute )
			? translate( 'Domains' )
			: translate( 'Other domains' );

		const mainHeader = isUnderEmailManagementInbox( currentRoute ) ? this.getMainHeader() : null;

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
				{ mainHeader }
				<SectionHeader label={ sectionHeaderLabel } />
				{ emailListItems }
			</div>
		);
	}
}

export default localize( EmailListInactive );

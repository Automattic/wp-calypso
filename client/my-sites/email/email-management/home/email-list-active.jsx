/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { CompactCard } from '@automattic/components';

/**
 * Internal dependencies
 */
import SectionHeader from 'calypso/components/section-header';
import { emailManagement } from 'calypso/my-sites/email/paths';
import EmailTypeIcon from 'calypso/my-sites/email/email-management/home/email-type-icon';
import { getNumberOfMailboxesText } from 'calypso/my-sites/email/email-management/home/utils';

class EmailListActive extends React.Component {
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
					<span className="email-list-active__item-icon">
						<EmailTypeIcon domain={ domain } />
					</span>
					<div>
						<h2>@{ domain.name }</h2>
						<span>{ getNumberOfMailboxesText( domain ) }</span>
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

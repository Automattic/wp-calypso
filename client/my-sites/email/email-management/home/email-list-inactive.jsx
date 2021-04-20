/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { Button, CompactCard } from '@automattic/components';

/**
 * Internal dependencies
 */
import { canAddEmailToDomain } from 'calypso/lib/domains';
import { emailManagement } from 'calypso/my-sites/email/paths';
import SectionHeader from 'calypso/components/section-header';

class EmailListInactive extends React.Component {
	render() {
		const { selectedSiteSlug, currentRoute, domains, translate } = this.props;

		if ( domains.length < 1 ) {
			return null;
		}

		const headerCard = <SectionHeader label={ translate( 'Other domains' ) } />;

		const emailListItems = domains.map( ( domain ) => {
			return (
				<CompactCard key={ `${ domain.name }-row` }>
					@{ domain.name }
					{ canAddEmailToDomain( domain ) && (
						<Button compact href={ emailManagement( selectedSiteSlug, domain.name, currentRoute ) }>
							{ translate( 'Add Email' ) }
						</Button>
					) }
				</CompactCard>
			);
		} );

		return (
			<div className="email-list-inactive__items">
				{ headerCard }
				{ emailListItems }
			</div>
		);
	}
}

export default localize( EmailListInactive );

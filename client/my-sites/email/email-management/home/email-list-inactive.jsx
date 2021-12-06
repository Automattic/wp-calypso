import { Button, Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import SectionHeader from 'calypso/components/section-header';
import { canCurrentUserAddEmail } from 'calypso/lib/domains';
import { emailManagementPurchaseNewEmailAccount } from 'calypso/my-sites/email/paths';

class EmailListInactive extends Component {
	render() {
		const {
			currentRoute,
			domains,
			headerComponent,
			sectionHeaderLabel,
			selectedSiteSlug,
			source,
			translate,
		} = this.props;
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
								currentRoute,
								source
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
				{ headerComponent }
				<SectionHeader label={ sectionHeaderLabel ?? translate( 'Other domains' ) } />
				{ emailListItems }
			</div>
		);
	}
}

EmailListInactive.propTypes = {
	currentRoute: PropTypes.string,
	domains: PropTypes.array,
	headerComponent: PropTypes.element,
	sectionHeaderLabel: PropTypes.string,
	selectedSiteSlug: PropTypes.string,
	source: PropTypes.string,
	translate: PropTypes.func.isRequired,
};

export default localize( EmailListInactive );

import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import {
	createSiteFromDomainOnly,
	domainManagementTransferToOtherSite,
} from 'calypso/my-sites/domains/paths';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import type { DomainOnlyConnectCardProps } from './types';

import './style.scss';

const DomainOnlyConnectCard = ( props: DomainOnlyConnectCardProps ): JSX.Element => {
	const translate = useTranslate();
	const { selectedSite, selectedDomainName, currentRoute } = props;

	return (
		<div className="domain-only-connect__card">
			<div className="domain-only-connect__card-content">
				<p>{ translate( 'Your domain is not associated with a WordPress.com site.' ) }</p>
			</div>
			<div className="domain-only-connect__card-button-container">
				<Button href={ createSiteFromDomainOnly( selectedDomainName ) } primary>
					{ translate( 'Create a site' ) }
				</Button>

				<Button
					href={ domainManagementTransferToOtherSite(
						selectedSite.slug,
						selectedDomainName,
						currentRoute
					) }
				>
					{ translate( 'Transfer to an existing site' ) }
				</Button>
			</div>
		</div>
	);
};

export default connect( ( state ) => ( {
	currentRoute: getCurrentRoute( state ),
} ) )( DomainOnlyConnectCard );

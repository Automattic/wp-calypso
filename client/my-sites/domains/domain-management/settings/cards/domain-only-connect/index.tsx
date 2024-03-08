import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import {
	createSiteFromDomainOnly,
	domainManagementTransferToOtherSite,
} from 'calypso/my-sites/domains/paths';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { IAppState } from 'calypso/state/types';
import type { DomainOnlyConnectCardProps } from './types';

import './style.scss';

const DomainOnlyConnectCard = ( props: DomainOnlyConnectCardProps ) => {
	const translate = useTranslate();
	const { selectedSite, selectedDomainName, currentRoute, hasConnectableSites } = props;

	return (
		<div className="domain-only-connect__card">
			<div className="domain-only-connect__card-content">
				<p>
					{ translate(
						'This domain is not associated to any site. Would you like to create one?'
					) }
				</p>
			</div>
			<div className="domain-only-connect__card-button-container">
				<Button href={ createSiteFromDomainOnly( selectedDomainName, selectedSite.ID ) } primary>
					{ translate( 'Add a new site' ) }
				</Button>

				{ hasConnectableSites && (
					<Button
						href={ domainManagementTransferToOtherSite(
							selectedSite.slug,
							selectedDomainName,
							currentRoute
						) }
					>
						{ translate( 'Attach to an existing site' ) }
					</Button>
				) }
			</div>
		</div>
	);
};

export default connect( ( state: IAppState ) => ( {
	currentRoute: getCurrentRoute( state ),
} ) )( DomainOnlyConnectCard );

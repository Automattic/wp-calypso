import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import { domainManagementTransferToOtherSite } from 'calypso/my-sites/domains/paths';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { IAppState } from 'calypso/state/types';
import type { DomainOnlyConnectCardProps } from './types';

import './style.scss';

const DomainOnlyConnectCard = ( props: DomainOnlyConnectCardProps ) => {
	const translate = useTranslate();
	const { selectedSite, selectedDomainName, currentRoute } = props;

	return (
		<div className="domain-only-connect__card">
			<div className="domain-only-connect__card-content">
				<p>{ translate( 'Your domain is not associated with a WordPress.com site.' ) }</p>
			</div>
			<div className="domain-only-connect__card-button-container">
				<Button
					href={ domainManagementTransferToOtherSite(
						selectedSite.slug,
						selectedDomainName,
						currentRoute
					) }
				>
					{ translate( 'Connect to an existing site' ) }
				</Button>
			</div>
		</div>
	);
};

export default connect( ( state: IAppState ) => ( {
	currentRoute: getCurrentRoute( state ),
} ) )( DomainOnlyConnectCard );

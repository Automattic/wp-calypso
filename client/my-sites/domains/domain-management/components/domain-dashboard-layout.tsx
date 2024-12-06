import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutColumn from 'calypso/a8c-for-agencies/components/layout/column';
import DomainManagement from 'calypso/my-sites/domains/domain-management';
import { domainManagementRoot } from 'calypso/my-sites/domains/paths';

type DomainDashboardLayoutProps = {
	innerContent: React.ReactNode;
};

function DomainDashboardLayout( props: DomainDashboardLayoutProps ) {
	return (
		<Layout title="Domain Management" wide className="domains-overview">
			<LayoutColumn className="domains-overview__list">
				<DomainManagement.BulkAllDomains
					analyticsPath={ domainManagementRoot() }
					analyticsTitle="Domain Management > All Domains"
					sidebarMode
				/>
			</LayoutColumn>
			<LayoutColumn className="domains-overview__details" wide>
				{ props.innerContent }
			</LayoutColumn>
		</Layout>
	);
}

export default DomainDashboardLayout;

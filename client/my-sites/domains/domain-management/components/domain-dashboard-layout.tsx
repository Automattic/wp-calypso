import { useTranslate } from 'i18n-calypso';
import Layout from 'calypso/layout/hosting-dashboard';
import LayoutColumn from 'calypso/layout/hosting-dashboard/column';
import DomainManagement from 'calypso/my-sites/domains/domain-management';
import { domainManagementRoot } from 'calypso/my-sites/domains/paths';

// Add Dotcom specific styles
import 'calypso/sites/components/dotcom-style.scss';

type DomainDashboardLayoutProps = {
	innerContent: React.ReactNode;
	selectedDomainName: string;
	selectedFeature: string;
};

function DomainDashboardLayout( props: DomainDashboardLayoutProps ) {
	const translate = useTranslate();

	return (
		<Layout
			title={ translate( 'Domain Management' ) }
			wide
			className={ `domains-overview${ props.selectedDomainName ? ' is-domain-selected' : '' }` }
		>
			<LayoutColumn className="domains-overview__list">
				<DomainManagement.BulkAllDomains
					analyticsPath={ domainManagementRoot() }
					analyticsTitle="Domain Management > All Domains"
					sidebarMode
					selectedDomainName={ props.selectedDomainName }
					selectedFeature={ props.selectedFeature }
				/>
			</LayoutColumn>
			<LayoutColumn className="domains-overview__details" wide>
				{ props.innerContent }
			</LayoutColumn>
		</Layout>
	);
}

export default DomainDashboardLayout;

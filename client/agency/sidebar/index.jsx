import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import Sidebar from 'calypso/layout/sidebar';
import SidebarFooter from 'calypso/layout/sidebar/footer';
import SidebarItem from 'calypso/layout/sidebar/item';
import SidebarMenu from 'calypso/layout/sidebar/menu';
import SidebarRegion from 'calypso/layout/sidebar/region';
import SidebarSeparator from 'calypso/layout/sidebar/separator';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';

import 'calypso/my-sites/sidebar/style.scss';
import './style.scss';

export class AgencySidebar extends Component {
	handleAgencySidebarDashboardClicked = () => {
		recordAction( 'clicked_agency_sidebar_dashboard' );
		recordGaEvent( 'Clicked Agency Sidebar Dashboard' );
	};

	handleAgencySidebarPluginsClicked = () => {
		recordAction( 'clicked_agency_sidebar_plugins' );
		recordGaEvent( 'Clicked Agency Sidebar Plugins' );
	};

	handleAgencySidebarLicensesClicked = () => {
		recordAction( 'clicked_agency_sidebar_licenses' );
		recordGaEvent( 'Clicked Agency Sidebar Licenses' );
	};

	handleAgencySidebarBillingClicked = () => {
		recordAction( 'clicked_agency_sidebar_billing' );
		recordGaEvent( 'Clicked Agency Sidebar Billing' );
	};

	handleAgencySidebarPaymentMethodsClicked = () => {
		recordAction( 'clicked_agency_sidebar_payment_methods' );
		recordGaEvent( 'Clicked Agency Sidebar Payment Methods' );
	};

	handleAgencySidebarInvoicesClicked = () => {
		recordAction( 'clicked_agency_sidebar_invoices' );
		recordGaEvent( 'Clicked Agency Sidebar Invoices' );
	};

	handleAgencySidebarPricesClicked = () => {
		recordAction( 'clicked_agency_sidebar_prices' );
		recordGaEvent( 'Clicked Agency Sidebar Prices' );
	};

	handleAgencySidebarCompanyDetailsClicked = () => {
		recordAction( 'clicked_agency_sidebar_company_details' );
		recordGaEvent( 'Clicked Agency Sidebar Company Details' );
	};

	render() {
		const { path, translate } = this.props;

		return (
			<Sidebar onClick={ this.handleClick }>
				<SidebarRegion>
					<SidebarMenu>
						<SidebarSeparator />
						<SidebarItem
							label={ translate( 'Dashboard' ) }
							onNavigate={ this.handleAgencySidebarDashboardClicked }
							icon="house"
							link="/agency/dashboard"
							className={ classNames( { selected: path === '/agency/dashboard' } ) }
						/>
						<SidebarItem
							label={ translate( 'Plugin Management' ) }
							onNavigate={ this.handleAgencySidebarPluginsClicked }
							icon="plugins"
							link="/agency/plugins"
							className={ classNames( { selected: path === '/agency/plugins' } ) }
						/>
						<SidebarSeparator />
						<SidebarItem
							label={ translate( 'Licenses' ) }
							onNavigate={ this.handleAgencySidebarLicensesClicked }
							icon="grid"
							link="/agency/licenses"
							className={ classNames( { selected: path === '/agency/licenses' } ) }
						/>
						<SidebarItem
							label={ translate( 'Billing' ) }
							onNavigate={ this.handleAgencySidebarBillingClicked }
							icon="money"
							link="/agency/billing"
							className={ classNames( { selected: path === '/agency/billing' } ) }
						/>
						<SidebarItem
							label={ translate( 'Payment Methods' ) }
							onNavigate={ this.handleAgencySidebarPaymentMethodsClicked }
							icon="credit-card"
							link="/agency/payment-methods"
							className={ classNames( { selected: path === '/agency/payment-methods' } ) }
						/>
						<SidebarItem
							label={ translate( 'Invoices' ) }
							onNavigate={ this.handleAgencySidebarInvoicesClicked }
							icon="pages"
							link="/agency/invoices"
							className={ classNames( { selected: path === '/agency/invoices' } ) }
						/>
						<SidebarItem
							label={ translate( 'Prices' ) }
							onNavigate={ this.handleAgencySidebarPricesClicked }
							icon="tag"
							link="/agency/prices"
							className={ classNames( { selected: path === '/agency/prices' } ) }
						/>
						<SidebarItem
							label={ translate( 'Company Details' ) }
							onNavigate={ this.handleAgencySidebarCompanyDetailsClicked }
							icon="cog"
							link="/agency/company-details"
							className={ classNames( { selected: path === '/agency/company-details' } ) }
						/>
					</SidebarMenu>
				</SidebarRegion>
				<SidebarFooter />
			</Sidebar>
		);
	}
}

export default localize( AgencySidebar );

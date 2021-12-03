import { useI18n } from '@wordpress/react-i18n';
import { connect } from 'react-redux';
import FormattedHeader from 'calypso/components/formatted-header';
import Breadcrumbs from 'calypso/my-sites/domains/domain-management/components/breadcrumbs';
import { domainManagementList, isUnderDomainManagementAll } from 'calypso/my-sites/domains/paths';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import './style.scss';
import type { DomainManagementHeaderProps } from './types';

const DomainManagementHeader = ( props: DomainManagementHeaderProps ) => {
	const { selectedDomainName, isManagingAllDomains, selectedSite } = props;
	const { __ } = useI18n();
	let formattedHeaderText = selectedDomainName;
	if ( ! selectedDomainName ) {
		formattedHeaderText = isManagingAllDomains ? __( 'All Domains' ) : __( 'Site Domains' );
	}

	const renderBreadcrumbs = () => {
		const items = [
			{
				// translators: Internet domains, e.g. mygroovydomain.com
				label: __( 'Domains' ),
				href: domainManagementList( selectedSite!.slug, selectedDomainName ),
			},
			{
				label: selectedDomainName,
			},
		];

		const mobileItem = {
			label: __( 'Back to domains' ),
			href: domainManagementList( selectedSite!.slug, selectedDomainName ),
			showBackArrow: true,
		};

		return <Breadcrumbs items={ items } mobileItem={ mobileItem } />;
	};

	return (
		<>
			{ renderBreadcrumbs() }
			<FormattedHeader
				brandFont
				className="domain-management-header__title"
				headerText={ formattedHeaderText }
				align="left"
				hasScreenOptions={ false }
			/>
		</>
	);
};

const connectComponent = connect( ( state ) => {
	const path = getCurrentRoute( state );
	return {
		isManagingAllDomains: isUnderDomainManagementAll( path ),
	};
} )( DomainManagementHeader );

export default connectComponent;

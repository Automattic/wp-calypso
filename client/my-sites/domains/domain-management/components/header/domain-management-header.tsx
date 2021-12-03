import { useI18n } from '@wordpress/react-i18n';
import PropTypes from 'prop-types';
import { Fragment } from 'react';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import HeaderCake from 'calypso/components/header-cake';
import Breadcrumbs from 'calypso/my-sites/domains/domain-management/components/breadcrumbs';
import {
	domainManagementEdit,
	domainManagementList,
	isUnderDomainManagementAll,
} from 'calypso/my-sites/domains/paths';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';

import './style.scss';

const DomainManagementHeader = ( props ) => {
	const {
		selectedDomainName,
		isManagingAllDomains,
		onClick,
		backHref,
		children,
		selectedSite,
	} = props;
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
				href: domainManagementList( selectedSite.slug, selectedDomainName ),
			},
			{
				label: selectedDomainName,
			},
		];

		const mobileItem = {
			label: __( 'Back to domains' ),
			href: domainManagementList( selectedSite.slug, selectedDomainName ),
			showBackArrow: true,
		};

		return <Breadcrumbs items={ items } mobileItem={ mobileItem } />;
	};

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<>
			{ renderBreadcrumbs() }
			<FormattedHeader
				brandFont
				className="stats__section-header"
				headerText={ formattedHeaderText }
				align="left"
				hasScreenOptions={ false }
			/>
		</>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

const connectComponent = connect( ( state ) => {
	const path = getCurrentRoute( state );
	return {
		isManagingAllDomains: isUnderDomainManagementAll( path ),
	};
} )( DomainManagementHeader );

export default connectComponent;

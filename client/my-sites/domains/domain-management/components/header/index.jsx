/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import HeaderCake from 'calypso/components/header-cake';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { useTranslate } from 'i18n-calypso';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { isUnderDomainManagementAll } from 'calypso/my-sites/domains/paths';

/**
 * Style dependencies
 */
import './style.scss';

const DomainManagementHeader = ( props ) => {
	const { isManagingAllDomains, onClick, backHref, children } = props;
	const translate = useTranslate();

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<React.Fragment>
			<FormattedHeader
				brandFont
				className="stats__section-header"
				headerText={
					isManagingAllDomains ? translate( 'All Domains' ) : translate( 'Site Domains' )
				}
				align="left"
			/>
			<HeaderCake className="domain-management-header" onClick={ onClick } backHref={ backHref }>
				<div className="domain-management-header__children">
					<span className="domain-management-header__title">{ children }</span>
				</div>
				<DocumentHead title={ children } />
			</HeaderCake>
		</React.Fragment>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

export default connect( ( state ) => {
	const path = getCurrentRoute( state );
	return {
		isManagingAllDomains: isUnderDomainManagementAll( path ),
	};
} )( DomainManagementHeader );

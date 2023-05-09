import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Fragment } from 'react';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import HeaderCake from 'calypso/components/header-cake';
import { isUnderDomainManagementAll } from 'calypso/my-sites/domains/paths';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';

import './style.scss';

const DomainManagementHeader = ( props ) => {
	const { selectedDomainName, isManagingAllDomains, onClick, backHref, children } = props;
	const translate = useTranslate();
	let formattedHeaderText = selectedDomainName;
	if ( ! selectedDomainName ) {
		formattedHeaderText = isManagingAllDomains
			? translate( 'All Domains' )
			: translate( 'Site Domains' );
	}

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<Fragment>
			<FormattedHeader
				brandFont
				className="stats__section-header"
				headerText={ formattedHeaderText }
				align="left"
			/>
			<HeaderCake className="domain-management-header" onClick={ onClick } backHref={ backHref }>
				<div className="domain-management-header__children">
					<span className="domain-management-header__title">{ children }</span>
				</div>
				<DocumentHead title={ children } />
			</HeaderCake>
		</Fragment>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

const connectComponent = connect( ( state ) => {
	const path = getCurrentRoute( state );
	return {
		isManagingAllDomains: isUnderDomainManagementAll( path ),
	};
} )( DomainManagementHeader );

connectComponent.propTypes = {
	selectedDomainName: PropTypes.string,
};

export default connectComponent;

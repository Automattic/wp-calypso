/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import page from 'page';
import { localize, translate } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import Header from 'my-sites/domains/domain-management/components/header';
import Main from 'components/main';
import SiteAddressChanger from 'blocks/site-address-changer';
import { getSelectedDomain, isRegisteredDomain } from 'lib/domains';
import { domainManagementEdit, domainManagementNameServers } from 'my-sites/domains/paths';

/**
 * Style dependencies
 */
import './style.scss';

class ChangeSiteAddress extends React.Component {
	static propTypes = {
		domains: PropTypes.array.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
	};

	goBack = () => {
		let path;

		if ( isRegisteredDomain( getSelectedDomain( this.props ) ) ) {
			path = domainManagementNameServers;
		} else {
			path = domainManagementEdit;
		}

		page( path( this.props.selectedSite.slug, this.props.selectedDomainName ) );
	};

	render() {
		const domain = getSelectedDomain( this.props );
		const dotblogSubdomain = get( domain, 'name', '' ).match( /\.\w+\.blog$/ );
		const domainSuffix = dotblogSubdomain ? dotblogSubdomain[ 0 ] : '.wordpress.com';

		return (
			<Main className="change-site-address">
				<Header onClick={ this.goBack } selectedDomainName={ domain }>
					{ translate( 'Change Site Address' ) }
				</Header>

				<SiteAddressChanger currentDomain={ domain } currentDomainSuffix={ domainSuffix } />
			</Main>
		);
	}
}

export default localize( ChangeSiteAddress );

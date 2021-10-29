import { localize, translate } from 'i18n-calypso';
import { get } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import SiteAddressChanger from 'calypso/blocks/site-address-changer';
import Main from 'calypso/components/main';
import { getSelectedDomain, isRegisteredDomain } from 'calypso/lib/domains';
import Header from 'calypso/my-sites/domains/domain-management/components/header';
import { domainManagementEdit, domainManagementNameServers } from 'calypso/my-sites/domains/paths';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';

import './style.scss';

class ChangeSiteAddress extends Component {
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

		page(
			path( this.props.selectedSite.slug, this.props.selectedDomainName, this.props.currentRoute )
		);
	};

	render() {
		const domain = getSelectedDomain( this.props );
		const dotblogSubdomain = get( domain, 'name', '' ).match( /\.\w+\.blog$/ );
		const domainSuffix = dotblogSubdomain ? dotblogSubdomain[ 0 ] : '.wordpress.com';

		return (
			<Main className="change-site-address">
				<Header onClick={ this.goBack } selectedDomainName={ get( domain, 'name', '' ) }>
					{ translate( 'Change Site Address' ) }
				</Header>

				<SiteAddressChanger currentDomain={ domain } currentDomainSuffix={ domainSuffix } />
			</Main>
		);
	}
}

export default connect( ( state ) => ( {
	currentRoute: getCurrentRoute( state ),
} ) )( localize( ChangeSiteAddress ) );

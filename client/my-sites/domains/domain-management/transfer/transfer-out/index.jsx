/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { omit } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import IcannVerification from './icann-verification.jsx';
import Locked from './locked.jsx';
import TransferProhibited from './transfer-prohibited.jsx';
import Unlocked from './unlocked.jsx';
import Main from 'components/main';
import { getSelectedDomain } from 'lib/domains';
import DomainMainPlaceholder from 'my-sites/domains/domain-management/components/domain/main-placeholder';
import NonOwnerCard from 'my-sites/domains/domain-management/components/domain/non-owner-card';
import Header from 'my-sites/domains/domain-management/components/header';
import paths from 'my-sites/domains/paths';

class Transfer extends React.Component {
	static propTypes = {
		domains: PropTypes.object.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [
			PropTypes.object,
			PropTypes.bool
		] ).isRequired,
		wapiDomainInfo: PropTypes.object.isRequired
	};

	renderSection() {
		const { locked, transferProhibited } = this.props.wapiDomainInfo.data;
		const { isPendingIcannVerification, currentUserCanManage } = getSelectedDomain( this.props );
		let section = null;

		if ( ! currentUserCanManage ) {
			section = NonOwnerCard;
		} else if ( transferProhibited ) {
			section = TransferProhibited;
		} else if ( isPendingIcannVerification ) {
			section = IcannVerification;
		} else if ( locked ) {
			section = Locked;
		} else {
			section = Unlocked;
		}

		return React.createElement( section, omit( this.props, [ 'children' ] ) );
	}

	render() {
		if ( this.isDataLoading() ) {
			return <DomainMainPlaceholder goBack={ this.goToEdit } />;
		}

		return (
			<Main className="domain-management-transfer">
				<Header
					onClick={ this.goToEdit }
					selectedDomainName={ this.props.selectedDomainName }>
					{ this.props.translate( 'Transfer Domain' ) }
				</Header>
				{ this.renderSection() }
			</Main>
		);
	}

	goToEdit = () => {
		page( paths.domainManagementTransfer(
			this.props.selectedSite.slug,
			this.props.selectedDomainName
		) );
	};

	isDataLoading() {
		return (
			! this.props.wapiDomainInfo.hasLoadedFromServer || ! this.props.domains.hasLoadedFromServer
		);
	}
}

export default localize( Transfer );

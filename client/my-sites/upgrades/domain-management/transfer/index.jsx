/**
 * External dependencies
 */
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import DomainMainPlaceholder from 'my-sites/upgrades/domain-management/components/domain/main-placeholder';
import Header from 'my-sites/upgrades/domain-management/components/header';
import Main from 'components/main';
import NonOwnerCard from 'my-sites/upgrades/domain-management/components/domain/non-owner-card';
import paths from 'my-sites/upgrades/paths';
import { getSelectedDomain } from 'lib/domains';
import IcannVerification from 'my-sites/upgrades/domain-management/transfer/icann-verification';
import Locked from 'my-sites/upgrades/domain-management/transfer/locked';
import Unlocked from 'my-sites/upgrades/domain-management/transfer/unlocked';
import TransferProhibited from 'my-sites/upgrades/domain-management/transfer/transfer-prohibited';
import omit from 'lodash/omit';

const Transfer = React.createClass( {
	propTypes: {
		domains: React.PropTypes.object.isRequired,
		selectedDomainName: React.PropTypes.string.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired,
		wapiDomainInfo: React.PropTypes.object.isRequired
	},

	renderSection() {
		const { locked, transferProhibited } = this.props.wapiDomainInfo.data,
			{ isPendingIcannVerification, currentUserCanManage } = getSelectedDomain( this.props );
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
	},

	render() {
		if ( this.isDataLoading() ) {
			return <DomainMainPlaceholder goBack={ this.goToEdit }/>;
		}

		return (
			<Main className="domain-management-transfer">
				<Header
					onClick={ this.goToEdit }
					selectedDomainName={ this.props.selectedDomainName }>
					{ this.translate( 'Transfer Domain' ) }
				</Header>
				{ this.renderSection() }
			</Main>
		);
	},

	goToEdit() {
		page( paths.domainManagementEdit(
			this.props.selectedSite.slug,
			this.props.selectedDomainName
		) );
	},

	isDataLoading() {
		return (
			! this.props.wapiDomainInfo.hasLoadedFromServer || ! this.props.domains.hasLoadedFromServer
		);
	}
} );

export default Transfer;

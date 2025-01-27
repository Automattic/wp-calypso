import page from '@automattic/calypso-router';
import { localize } from 'i18n-calypso';
import { omit } from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import { createElement, Component, Fragment } from 'react';
import { connect } from 'react-redux';
import QueryDomainInfo from 'calypso/components/data/query-domain-info';
import Main from 'calypso/components/main';
import { getSelectedDomain, getTopLevelOfTld } from 'calypso/lib/domains';
import DomainMainPlaceholder from 'calypso/my-sites/domains/domain-management/components/domain/main-placeholder';
import NonOwnerCard from 'calypso/my-sites/domains/domain-management/components/domain/non-owner-card';
import Header from 'calypso/my-sites/domains/domain-management/components/header';
import { domainManagementTransfer } from 'calypso/my-sites/domains/paths';
import { getDomainWapiInfoByDomainName } from 'calypso/state/domains/transfer/selectors';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import IcannVerification from './icann-verification.jsx';
import Locked from './locked.jsx';
import SelectIpsTag from './select-ips-tag.jsx';
import TransferLock from './transfer-lock.jsx';
import TransferProhibited from './transfer-prohibited.jsx';
import Unlocked from './unlocked.jsx';

import './style.scss';

class Transfer extends Component {
	static propTypes = {
		domains: PropTypes.array.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
		wapiDomainInfo: PropTypes.object.isRequired,
	};

	renderSection() {
		const topLevelOfTld = getTopLevelOfTld( this.props.selectedDomainName );
		const { locked, transferProhibited } = this.props.wapiDomainInfo.data;
		const { currentUserCanManage, isPendingIcannVerification, transferAwayEligibleAt } =
			getSelectedDomain( this.props ) ?? {};
		let section = null;

		if ( ! currentUserCanManage ) {
			section = NonOwnerCard;
		} else if ( transferProhibited ) {
			section = TransferProhibited;
		} else if ( transferAwayEligibleAt && moment( transferAwayEligibleAt ).isAfter() ) {
			section = TransferLock;
		} else if ( 'uk' === topLevelOfTld ) {
			section = SelectIpsTag;
		} else if ( isPendingIcannVerification ) {
			section = IcannVerification;
		} else if ( locked ) {
			section = Locked;
		} else {
			section = Unlocked;
		}

		return createElement( section, omit( this.props, [ 'children' ] ) );
	}

	render() {
		if ( this.isDataLoading() ) {
			return (
				<Fragment>
					<QueryDomainInfo domainName={ this.props.selectedDomainName } />
					<DomainMainPlaceholder goBack={ this.goToEdit } />
				</Fragment>
			);
		}

		return (
			<Main>
				<QueryDomainInfo domainName={ this.props.selectedDomainName } />
				<Header onClick={ this.goToEdit } selectedDomainName={ this.props.selectedDomainName }>
					{ this.props.translate( 'Transfer Domain' ) }
				</Header>
				{ this.renderSection() }
			</Main>
		);
	}

	goToEdit = () => {
		page(
			domainManagementTransfer(
				this.props.selectedSite.slug,
				this.props.selectedDomainName,
				this.props.currentRoute
			)
		);
	};

	isDataLoading() {
		return (
			! this.props.wapiDomainInfo.hasLoadedFromServer ||
			this.props.isRequestingSiteDomains ||
			! this.props.hasSiteDomainsLoaded
		);
	}
}

export default connect( ( state, { selectedDomainName } ) => ( {
	currentRoute: getCurrentRoute( state ),
	wapiDomainInfo: getDomainWapiInfoByDomainName( state, selectedDomainName ),
} ) )( localize( Transfer ) );

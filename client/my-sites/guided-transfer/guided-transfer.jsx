/**
 * External dependencies
 */
import React from 'react';
import i18n, { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';
import HostCredentialsPage from './host-credentials-page';
import HostSelect from './host-select';
import IssuesNotices from './issues-notices';
import Main from 'components/main';
import QuerySiteGuidedTransfer from 'components/data/query-site-guided-transfer';
import TransferUnavailableCard from './transfer-unavailable-card';

/**
 * Style dependencies
 */
import './style.scss';

const guidedTransferHosts = {
	bluehost: {
		label: i18n.translate( 'Bluehost' ),
		logo: '/calypso/images/guided-transfer/bluehost-logo.png',
		url: 'https://bluehost.com/track/wpgt?page=/web-hosting/signup',
	},
	siteground: {
		logo: '/calypso/images/guided-transfer/siteground-logo.png',
		label: i18n.translate( 'SiteGround' ),
		url: 'https://www.siteground.com/wordpress-hosting.htm?afcode=134c903505c0a2296bd25772edebf669',
	},
	pressable: {
		logo: '/calypso/images/guided-transfer/pressable-logo.png',
		label: i18n.translate( 'Pressable' ),
		url: 'https://pressable.com',
	},
};

class GuidedTransfer extends React.Component {
	static displayName = 'GuidedTransfer';

	static propTypes = {
		hostSlug: PropTypes.string,
		siteId: PropTypes.number.isRequired,
		siteSlug: PropTypes.string.isRequired,
	};

	showExporter = () => {
		page( `/export/${ this.props.siteSlug }` );
	};

	showHostSelection = () => {
		page( `/export/guided/${ this.props.siteSlug }` );
	};

	showHost = ( hostSlug ) => {
		page( `/export/guided/${ hostSlug }/${ this.props.siteSlug }` );
	};

	goBack = () => {
		if ( this.props.hostSlug ) {
			this.showHostSelection();
		} else {
			this.showExporter();
		}
	};

	render() {
		const { siteId, siteSlug } = this.props;
		const hostInfo = get( guidedTransferHosts, this.props.hostSlug );
		const hosts = Object.keys( guidedTransferHosts ).map( ( hostSlug ) => {
			return {
				...guidedTransferHosts[ hostSlug ],
				showHost: () => this.showHost( hostSlug ),
			};
		} );

		return (
			<Main className="guided-transfer__main site-settings">
				<QuerySiteGuidedTransfer siteId={ siteId } />
				<div className="guided-transfer__header-nav">
					<HeaderCake onClick={ this.goBack } isCompact={ true }>
						{ this.props.translate( 'Guided Transfer' ) }
					</HeaderCake>
				</div>

				<IssuesNotices siteId={ siteId } siteSlug={ siteSlug } />

				{ this.props.isEligibleForGuidedTransfer ? (
					<div className="guided-transfer__content">
						{ hostInfo ? (
							<HostCredentialsPage
								siteId={ this.props.siteId }
								hostSlug={ this.props.hostSlug }
								hostInfo={ hostInfo }
							/>
						) : (
							<HostSelect hosts={ hosts } />
						) }
					</div>
				) : (
					<TransferUnavailableCard siteId={ siteId } siteSlug={ siteSlug } />
				) }
			</Main>
		);
	}
}

export default localize( GuidedTransfer );

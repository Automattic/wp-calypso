/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import page from 'page';
import get from 'lodash/get';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import QuerySiteGuidedTransfer from 'components/data/query-site-guided-transfer';
import HeaderCake from 'components/header-cake';
import HostCredentialsPage from './host-credentials-page';
import HostSelect from './host-select';
import IssuesNotices from './issues-notices';
import TransferUnavailableCard from './transfer-unavailable-card';

const guidedTransferHosts = {
	bluehost: {
		label: i18n.translate( 'Bluehost' ),
		logo: '/calypso/images/guided-transfer/bluehost-logo.png',
		url: 'https://bluehost.com/track/wpgt?page=/web-hosting/signup',
	},
	siteground: {
		logo: '/calypso/images/guided-transfer/siteground-logo.png',
		label: i18n.translate( 'SiteGround' ),
		url: 'https://www.siteground.com/wordpress-hosting.htm?afcode=134c903505c0a2296bd25772edebf669'
	}
};

export default React.createClass( {
	displayName: 'GuidedTransfer',

	propTypes: {
		hostSlug: PropTypes.string,
		siteId: PropTypes.number.isRequired,
		siteSlug: PropTypes.string.isRequired
	},

	showExporter() {
		page( `/settings/export/${this.props.siteSlug}` );
	},

	showHostSelection() {
		page( `/settings/export/guided/${this.props.siteSlug}` );
	},

	showHost( hostSlug ) {
		page( `/settings/export/guided/${hostSlug}/${this.props.siteSlug}` );
	},

	goBack() {
		if ( this.props.hostSlug ) {
			this.showHostSelection();
		} else {
			this.showExporter();
		}
	},

	render: function() {
		const hostInfo = get( guidedTransferHosts, this.props.hostSlug );
		const hosts = Object.keys( guidedTransferHosts ).map( hostSlug => {
			return {
				...guidedTransferHosts[ hostSlug ],
				showHost: () => this.showHost( hostSlug )
			};
		} );

		const { siteId, siteSlug } = this.props;

		return (
			<div className="guided-transfer">
				<QuerySiteGuidedTransfer siteId={ siteId } />
				<div className="guided-transfer__header-nav">
					<HeaderCake
						onClick={ this.goBack }
						isCompact={ true }
					>
							{ this.translate( 'Guided Transfer' ) }
					</HeaderCake>
				</div>

				<IssuesNotices siteId={ siteId } siteSlug={ siteSlug } />

				{ this.props.isEligibleForGuidedTransfer
					? <div className="guided-transfer__content">
						{ hostInfo
							? <HostCredentialsPage
								siteId={ this.props.siteId }
								hostSlug={ this.props.hostSlug }
								hostInfo={ hostInfo } />
							: <HostSelect hosts={ hosts } />
						}
					</div>
					: <TransferUnavailableCard siteId={ siteId } siteSlug={ siteSlug } />
				}
			</div>
		);
	}
} );

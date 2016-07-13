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
import HeaderCake from 'components/header-cake';
import AccountInfo from './account-info';
import HostSelect from './host-select';

const guidedTransferHosts = {
	bluehost: {
		label: i18n.translate( 'Bluehost' ),
		logo: '/calypso/images/guided-transfer/bluehost-logo.png',
		url: '#bluehost',
	},
	siteground: {
		logo: '/calypso/images/guided-transfer/siteground-logo.png',
		label: i18n.translate( 'SiteGround' ),
		url: '#siteground'
	}
};

export default React.createClass( {
	displayName: 'GuidedTransfer',

	propTypes: {
		hostSlug: PropTypes.string,
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

		return (
			<div className="guided-transfer">
				<div className="guided-transfer__header-nav">
					<HeaderCake
						onClick={ this.goBack }
						isCompact={ true }
					>
							{ this.translate( 'Guided Transfer' ) }
					</HeaderCake>
				</div>

				<div className="guided-transfer__content">
					{ hostInfo
						? <AccountInfo hostInfo={ hostInfo } />
						: <HostSelect hosts={ hosts } />
					}
				</div>
			</div>
		);
	}
} );

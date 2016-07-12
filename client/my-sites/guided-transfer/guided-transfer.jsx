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
import Button from 'components/button';
import HeaderCake from 'components/header-cake';
import AccountInfo from './account-info';

const guidedTransferHosts = {
	bluehost: {
		label: i18n.translate( 'Bluehost' ),
		url: '#bluehost',
	},
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

	showBluehostAccountInfo() {
		page( `/settings/export/guided/bluehost/${this.props.siteSlug}` );
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

		return (
			<div className="guided-transfer">
				<div className="guided-transfer__header-nav">
					<HeaderCake onClick={ this.goBack }>
						{ this.translate( 'Guided Transfer' ) }
					</HeaderCake>
				</div>

				<div className="guided-transfer__content">
					{ hostInfo
						? <AccountInfo hostInfo={ hostInfo } />
						: <Button onClick={ this.showBluehostAccountInfo }>Bluehost</Button>
					}
				</div>
			</div>
		);
	}
} );

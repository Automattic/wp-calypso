/**
 * External dependencies
 *
 * @format
 */

import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import GoogleAppsDialog from 'components/upgrades/google-apps/google-apps-dialog';
import Main from 'components/main';

export class GsuiteNudge extends React.Component {
	static propTypes = {
		receiptId: PropTypes.number.isRequired,
		productsList: PropTypes.object.isRequired,
		selectedSite: PropTypes.object.isRequired,
	};

	render() {
		const { selectedSite, translate } = this.props;
		const siteTitle = ( selectedSite && selectedSite.name ) || '';

		return (
			<Main className="gsuite-nudge">
				<DocumentHead
					title={ translate( 'Add G Suite < %(siteTitle)s', {
						args: { siteTitle },
					} ) }
				/>
				<GoogleAppsDialog
					domain={ this.props.domain }
					productsList={ this.props.productsList }
					onClickSkip={ this.props.onClickSkip }
					onAddGoogleApps={ this.props.onAddGoogleApps }
					selectedSite={ selectedSite }
				/>
			</Main>
		);
	}
}

export default localize( GsuiteNudge );

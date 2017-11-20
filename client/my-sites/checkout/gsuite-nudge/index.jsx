/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import GoogleAppsDialog from 'components/upgrades/google-apps/google-apps-dialog';
import Main from 'components/main';
import { getSite } from 'state/sites/selectors';

export class GsuiteNudge extends React.Component {
	static propTypes = {
		domain: PropTypes.string.isRequired,
		receiptId: PropTypes.number.isRequired,
		productsList: PropTypes.object.isRequired,
		selectedSiteId: PropTypes.number.isRequired,
	};

	handleClickSkip = () => {
		this.props.onClickSkip( this.props.siteSlug );
	};

	handleAddGoogleApps = googleAppsCartItem => {
		this.props.onAddGoogleApps( googleAppsCartItem, this.props.siteSlug );
	};

	render() {
		const { siteTitle, translate } = this.props;

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
					onClickSkip={ this.handleClickSkip }
					onAddGoogleApps={ this.handleAddGoogleApps }
				/>
			</Main>
		);
	}
}

export default connect( ( state, props ) => {
	const selectedSite = getSite( state, props.selectedSiteId );
	return {
		siteSlug: get( selectedSite, 'slug', '' ),
		siteTitle: get( selectedSite, 'name', '' ),
	};
} )( localize( GsuiteNudge ) );

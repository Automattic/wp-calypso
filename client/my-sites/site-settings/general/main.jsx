/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import DocumentHead from 'components/data/document-head';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import SiteSettingsNavigation from 'my-sites/site-settings/navigation';
import GeneralForm from 'my-sites/site-settings/form-general';
import DeleteSiteOptions from 'my-sites/site-settings/delete-site-options';
import QuerySitePurchases from 'components/data/query-site-purchases';
import config from 'config';
import notices from 'notices';
import { getSitePurchases, hasLoadedSitePurchasesFromServer, getPurchasesError } from 'state/purchases/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

class SiteSettingsGeneral extends Component {
	static propTypes = {
		site: PropTypes.object.isRequired,
		hasLoadedSitePurchasesFromServer: PropTypes.bool.isRequired,
		sitePurchases: PropTypes.array.isRequired,
		purchasesError: PropTypes.object,
	};

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.purchasesError ) {
			notices.error( nextProps.purchasesError );
		}
	}

	render() {
		const {
			site,
			sitePurchases,
			translate,
		} = this.props;

		return (
			<Main className="general__main site-settings">
				<DocumentHead title={ translate( 'Site Settings' ) } />
				{ site && <QuerySitePurchases siteId={ site.ID } /> }

				<SidebarNavigation />
				<SiteSettingsNavigation site={ site } section="general" />

				<GeneralForm site={ site } />

				{ config.isEnabled( 'manage/site-settings/delete-site' ) && ! site.jetpack && ! site.is_vip &&
					<DeleteSiteOptions
						site={ site }
						sitePurchases={ sitePurchases }
						hasLoadedSitePurchasesFromServer={ this.props.hasLoadedSitePurchasesFromServer }
					/>
				}
			</Main>
		);
	}
}

export default connect(
	( state ) => ( {
		hasLoadedSitePurchasesFromServer: hasLoadedSitePurchasesFromServer( state ),
		purchasesError: getPurchasesError( state ),
		sitePurchases: getSitePurchases( state, getSelectedSiteId( state ) ),
	} )
)( localize( SiteSettingsGeneral ) );

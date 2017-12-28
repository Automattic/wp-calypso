/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import HeaderCake from 'client/components/header-cake';
import ActionPanel from 'client/my-sites/site-settings/action-panel';
import ActionPanelTitle from 'client/my-sites/site-settings/action-panel/title';
import ActionPanelBody from 'client/my-sites/site-settings/action-panel/body';
import ActionPanelFigure from 'client/my-sites/site-settings/action-panel/figure';
import ActionPanelFooter from 'client/my-sites/site-settings/action-panel/footer';
import Button from 'client/components/button';
import support from 'client/lib/url/support';
import { getSelectedSiteSlug } from 'client/state/ui/selectors';

const StartOver = ( { translate, selectedSiteSlug } ) => {
	return (
		<div className="main main-column" role="main">
			<HeaderCake backHref={ '/settings/general/' + selectedSiteSlug }>
				<h1>{ translate( 'Start Over' ) }</h1>
			</HeaderCake>
			<ActionPanel>
				<ActionPanelBody>
					<ActionPanelFigure inlineBodyText={ true }>
						<img src="/calypso/images/wordpress/logo-stars.svg" width="170" height="143" />
					</ActionPanelFigure>
					<ActionPanelTitle>{ translate( 'Start Over' ) }</ActionPanelTitle>
					<p>
						{ translate(
							"If you want a site but don't want any of the posts and pages you have now, our support " +
								'team can delete your posts, pages, media, and comments for you.'
						) }
					</p>
					<p>
						{ translate(
							'This will keep your site and URL active, but give you a fresh start on your content ' +
								'creation. Just contact us to have your current content cleared out.'
						) }
					</p>
					<p>
						{ translate(
							'Alternatively, you can delete all content from your site by following the steps here.'
						) }
					</p>
				</ActionPanelBody>
				<ActionPanelFooter>
					<Button
						className="settings-action-panel__support-button is-external"
						href={ support.EMPTY_SITE }
					>
						{ translate( 'Follow the Steps' ) }
						<Gridicon icon="external" size={ 48 } />
					</Button>
					<Button className="settings-action-panel__support-button" href="/help/contact">
						{ translate( 'Contact Support' ) }
					</Button>
				</ActionPanelFooter>
			</ActionPanel>
		</div>
	);
};

export default connect( state => ( {
	selectedSiteSlug: getSelectedSiteSlug( state ),
} ) )( localize( StartOver ) );

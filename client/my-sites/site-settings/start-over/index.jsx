/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';
import ActionPanel from 'my-sites/site-settings/action-panel';
import ActionPanelTitle from 'my-sites/site-settings/action-panel/title';
import ActionPanelBody from 'my-sites/site-settings/action-panel/body';
import ActionPanelFigure from 'my-sites/site-settings/action-panel/figure';
import ActionPanelFooter from 'my-sites/site-settings/action-panel/footer';
import Button from 'components/button';
import Gridicon from 'components/gridicon';
import support from 'lib/url/support';

const StartOver = React.createClass( {
	getInitialState() {
		return {
			site: this.props.sites.getSelectedSite()
		};
	},

	componentWillMount() {
		this.props.sites.on( 'change', this._updateSite );
	},

	componentWillUnmount() {
		this.props.sites.off( 'change', this._updateSite );
	},

	render() {
		const { translate } = this.props;
		const strings = {
			startOver: translate( 'Start Over' ),
			contactSupport: translate( 'Contact Support' ),
			emptySite: translate( 'Follow the Steps' )
		};

		return (
			<div className="main main-column" role="main">
				<HeaderCake onClick={ this._goBack }><h1>{ strings.startOver }</h1></HeaderCake>
				<ActionPanel>
					<ActionPanelBody>
						<ActionPanelFigure inlineBodyText={ true }>
							<img src="/calypso/images/wordpress/logo-stars.svg" width="170" height="143" />
						</ActionPanelFigure>
						<ActionPanelTitle>{ strings.startOver }</ActionPanelTitle>
						<p>{
							translate( 'If you want a site but don\'t want any of the posts and pages you have now, our support ' +
								'team can delete your posts, pages, media, and comments for you.' )
						}</p>
						<p>{
							translate( 'This will keep your site and URL active, but give you a fresh start on your content ' +
								'creation. Just contact us to have your current content cleared out.' )
						}</p>
						<p>{
							translate( 'Alternatively, you can delete all content from your site by following the steps here.' )
						}</p>
					</ActionPanelBody>
					<ActionPanelFooter>
						<Button
							className="settings-action-panel__support-button is-external"
							href={ support.EMPTY_SITE }>
							{ strings.emptySite }
							<Gridicon icon="external" size={ 48 } />
						</Button>
						<Button
							className="settings-action-panel__support-button"
							href="/help/contact">
							{ strings.contactSupport }
						</Button>
					</ActionPanelFooter>
				</ActionPanel>
			</div>
		);
	},

	_updateSite() {
		this.setState( {
			site: this.props.sites.getSelectedSite()
		} );
	},

	_goBack() {
		const site = this.state.site;
		page( '/settings/general/' + site.slug );
	}

} );

export default localize( StartOver );

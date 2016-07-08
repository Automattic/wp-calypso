/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import debugFactory from 'debug';
import LinkedStateMixin from 'react-addons-linked-state-mixin';
import page from 'page';
import property from 'lodash/property';
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
import config from 'config';
import DeleteSiteWarningDialog from 'my-sites/site-settings/delete-site-warning-dialog';
import Dialog from 'components/dialog';
import { getSitePurchases, hasLoadedSitePurchasesFromServer } from 'state/purchases/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import Gridicon from 'components/gridicon';
import Notice from 'components/notice';
import notices from 'notices';
import purchasesPaths from 'me/purchases/paths';
import QuerySitePurchases from 'components/data/query-site-purchases';
import SiteListActions from 'lib/sites-list/actions';

/**
 * Module vars
 */
const debug = debugFactory( 'calypso:my-sites:site-settings' );

export const DeleteSite = React.createClass( {

	mixins: [ LinkedStateMixin ],

	getInitialState: function() {
		return {
			showConfirmDialog: false,
			confirmDomain: '',
			site: this.props.sites.getSelectedSite(),
			showWarningDialog: false
		};
	},

	componentWillMount: function() {
		debug( 'Mounting DeleteSite React component.' );
		this.props.sites.on( 'change', this._updateSite );
	},

	componentWillUnmount: function() {
		this.props.sites.off( 'change', this._updateSite );
	},

	renderNotice: function() {
		const site = this.state.site;

		if ( ! site ) {
			return null;
		}

		return (
			<Notice status="is-warning" showDismiss={ false }>
				{ this.translate( '{{strong}}%(domain)s{{/strong}} will be unavailable in the future.', {
					components: {
						strong: <strong />
					},
					args: {
						domain: site.domain
					}
				} ) }
			</Notice>
		);
	},

	render: function() {
		const site = this.state.site,
			adminURL = site.options && site.options.admin_url ? site.options.admin_url : '',
			exportLink = config.isEnabled( 'manage/export' ) ? '/settings/export/' + site.slug : adminURL + 'tools.php?page=export-choices',
			exportTarget = config.isEnabled( 'manage/export' ) ? undefined : '_blank',
			deleteDisabled = ( typeof this.state.confirmDomain !== 'string' || this.state.confirmDomain.replace( /\s/g, '' ) !== site.domain );

		const deleteButtons = [
			<Button
				onClick={ this.closeConfirmDialog }>{
					this.translate( 'Cancel' )
			}</Button>,
			<Button
				primary
				scary
				disabled={ deleteDisabled }
				onClick={ this._deleteSite }>{
					this.translate( 'Delete this Site' )
			}</Button>
		];

		const strings = {
			deleteSite: this.translate( 'Delete Site' ),
			confirmDeleteSite: this.translate( 'Confirm Delete Site' ),
			exportContentFirst: this.translate( 'Export Content First' ),
			exportContent: this.translate( 'Export Content' ),
			contactSupport: this.translate( 'Contact Support' )
		};

		return (
			<div className="main main-column" role="main">
				{ site && <QuerySitePurchases siteId={ site.ID } /> }
				<HeaderCake onClick={ this._goBack }><h1>{ strings.deleteSite }</h1></HeaderCake>
				<ActionPanel>
					<ActionPanelBody>
						<ActionPanelFigure>
							<svg width="158" height="174" viewBox="0 0 158 174" xmlns="http://www.w3.org/2000/svg"><title>{ strings.exportContent }</title><g transform="translate(0 -5)" fill="none" fillRule="evenodd"><rect fill="#D5E5EB" x="57" y="157" width="45" height="22" rx="4"/><text fontFamily="Open Sans" fontSize="11" fontWeight="526" fill="#FFF"><tspan x="69.736" y="172">.ZIP</tspan></text><path d="M89.5 131.5h-6v-9h-9v9h-6L79 142l10.5-10.5zm-21 13.5v3h21v-3h-21z" fill="#D5E5EB"/><path d="M61 118h36v36H61v-36z"/><path d="M.03 40.992l54.486-29.92 25.18 13.238-54.62 29.734L.032 40.992z" fill="#D5E5EB"/><path d="M157.9 40.992l-54.484-29.92-25.18 13.238 54.62 29.734L157.9 40.992z" fill="#D5E5EB"/><path d="M118.9 43.846c0 21.098-17.186 38.266-38.304 38.266-21.118 0-38.303-17.168-38.303-38.266S59.478 5.58 80.596 5.58 118.9 22.748 118.9 43.846zM65.55 74.81L49.132 29.837a34.013 34.013 0 0 0-2.992 14.008c0 13.624 7.952 25.367 19.41 30.963zM101.2 53.24c1.495-4.783 2.65-8.2 2.65-11.147 0-4.23-1.54-7.175-2.864-9.48-1.71-2.82-3.378-5.21-3.378-8.072 0-3.16 2.394-6.108 5.772-6.108l.47.042c-6.114-5.594-14.278-9.052-23.256-9.052-12.012 0-22.614 6.19-28.77 15.502l2.223.042c3.59 0 9.148-.427 9.148-.427 1.88-.086 2.094 2.605.256 2.86 0 0-1.88.214-3.976.3l12.568 37.284 7.525-22.593-5.344-14.692c-1.88-.085-3.633-.298-3.633-.298-1.84-.128-1.625-2.947.214-2.86 0 0 5.685.425 9.063.425 3.633 0 9.19-.427 9.19-.427 1.838-.086 2.094 2.605.215 2.86 0 0-1.84.214-3.934.3l12.44 36.985 3.422-11.446zM92.01 76.304c-.085-.172-.17-.3-.213-.47l-10.603-29L70.85 76.86c3.12.895 6.37 1.365 9.746 1.365 4.02 0 7.865-.683 11.414-1.92zm19.024-45.44c0 3.5-.643 7.43-2.608 12.342L97.91 73.57c10.216-5.936 17.098-17.04 17.098-29.724 0-5.98-1.495-11.616-4.188-16.528a31.01 31.01 0 0 1 .214 3.546z" fill="#A8BECE"/><path d="M133.263 53.938v37.715L79 113.728V76.014l54.263-22.076zM24.737 53.938v37.715L79 113.728V76.014L24.737 53.938z" fill="#D5E5EB"/><path d="M155.74 70.355L102.527 92.48 78.125 75.12l55.24-21.407 22.374 16.642z" stroke="#FFF" strokeWidth="2.4" fill="#D5E5EB"/><path d="M2.08 70.355L55.294 92.48l24.402-17.36-54.582-21.297L2.08 70.355z" stroke="#FFF" strokeWidth="2.4" fill="#D5E5EB"/></g></svg>
						</ActionPanelFigure>
						<ActionPanelTitle>{ strings.exportContentFirst }</ActionPanelTitle>
						<p>{
							this.translate( 'Before deleting your site, please take the time to export your content now. ' +
								'All your posts, pages, and settings will be packaged into a .zip file that you can use in ' +
								'the future to resume where you left off.' )
						}
						</p>
						<p>{
							this.translate( 'Keep in mind that this content {{strong}}can not{{/strong}} be recovered in the future.', {
								components: {
									strong: <strong />
								}
							} )
						}</p>
					</ActionPanelBody>
					<ActionPanelFooter>
						<Button
							className="settings-action-panel__export-button"
							disabled={ ! this.state.site }
							onClick={ this._checkSiteLoaded }
							href={ exportLink }
							target={ exportTarget }>
							{ strings.exportContent }
							<Gridicon icon="external" />
						</Button>
					</ActionPanelFooter>
				</ActionPanel>
				<ActionPanel>
					<ActionPanelTitle>{ strings.deleteSite }</ActionPanelTitle>
					<ActionPanelBody>
						{ this.renderNotice() }
						<ActionPanelFigure>
							<h3 className="delete-site__content-list-header">{ this.translate( 'These items will be deleted' ) }</h3>
							<ul className="delete-site__content-list">
								<li className="delete-site__content-list-item">{ this.translate( 'Posts' ) }</li>
								<li className="delete-site__content-list-item">{ this.translate( 'Pages' ) }</li>
								<li className="delete-site__content-list-item">{ this.translate( 'Media' ) }</li>
								<li className="delete-site__content-list-item">{ this.translate( 'Users & Authors' ) }</li>
								<li className="delete-site__content-list-item">{ this.translate( 'Domains' ) }</li>
								<li className="delete-site__content-list-item">{ this.translate( 'Purchased Upgrades' ) }</li>
							</ul>
						</ActionPanelFigure>
						<p>{
							this.translate( 'This action {{strong}}can not{{/strong}} be undone. Deleting the site will remove all content, ' +
								'contributors, domains, and upgrades from the site.', {
									components: {
										strong: <strong />
									}
								} )
						}</p>
						<p>{
							this.translate( 'If you\'re unsure about what will be deleted or need any help, not to worry, our support team ' +
								'is here to answer any questions you might have.' )
						}</p>
						<p><a className="settings-action-panel__body-text-link" href="/help/contact">{ strings.contactSupport }</a></p>
					</ActionPanelBody>
					<ActionPanelFooter>
						<Button
							scary
							disabled={ ! this.state.site || ! this.props.hasLoadedSitePurchasesFromServer }
							onClick={ this.handleDeleteSiteClick }>
							<Gridicon icon="trash" />
							{ strings.deleteSite }
						</Button>
					</ActionPanelFooter>
					<DeleteSiteWarningDialog
						isVisible={ this.state.showWarningDialog }
						onClose={ this.closeWarningDialog } />
					<Dialog isVisible={ this.state.showConfirmDialog } buttons={ deleteButtons } className="delete-site__confirm-dialog">
						<h1 className="delete-site__confirm-header">{ strings.confirmDeleteSite }</h1>
						<p className="delete-site__confirm-paragraph">{
							this.translate( 'Please type in {{warn}}%(siteAddress)s{{/warn}} in the field below to confirm. Your site will then be gone forever.', {
								components: {
									warn: <span className="delete-site__target-domain"/>
								},
								args: {
									siteAddress: site.domain
								}
							} )
						}</p>
					<input className="delete-site__confirm-input" type="text" valueLink={ this.linkState( 'confirmDomain' ) }/>
					</Dialog>
				</ActionPanel>
			</div>
		);
	},

	handleDeleteSiteClick: function( event ) {
		var hasActiveSubscriptions;

		event.preventDefault();

		if ( ! this.props.hasLoadedSitePurchasesFromServer ) {
			return;
		}

		hasActiveSubscriptions = this.props.sitePurchases.filter( property( 'active' ) ).length > 0;

		if ( hasActiveSubscriptions ) {
			this.setState( { showWarningDialog: true } );
		} else {
			this.setState( { showConfirmDialog: true } );
		}
	},

	closeConfirmDialog: function() {
		this.setState( { showConfirmDialog: false } );
	},

	closeWarningDialog: function() {
		this.setState( { showWarningDialog: false } );
	},

	_goBack: function() {
		var site = this.state.site;
		page( '/settings/general/' + site.slug );
	},

	_deleteSite: function() {
		var siteDomain = this.state.site.domain;

		this.setState( { showConfirmDialog: false } );

		notices.success(
			this.translate( '{{strong}}%(siteDomain)s{{/strong}} is being deleted.', {
				args: { siteDomain: siteDomain },
				components: { strong: <strong /> }
			} )
		);

		SiteListActions.deleteSite( this.state.site, function( error ) {
			if ( ! error ) {
				page.redirect( '/stats' );

				notices.success(
					this.translate( '{{strong}}%(siteDomain)s{{/strong}} has been deleted.', {
						args: { siteDomain: siteDomain },
						components: { strong: <strong /> }
					} )
				);
			} else if ( error.error === 'active-subscriptions' ) {
				error.message = this.translate( 'You must cancel any active subscriptions prior to deleting your site.' );
				notices.error( error.message, {
					button: 'Manage Purchases',
					showDismiss: false,
					onClick: this.managePurchases
				} );
			} else {
				notices.error( error.message );
			}
		}.bind( this ) );
	},

	_updateSite: function() {
		this.setState( {
			site: this.props.sites.getSelectedSite()
		} );
	},

	_checkSiteLoaded: function( event ) {
		if ( ! this.state.site ) {
			event.preventDefault();
		}
	},

	managePurchases: function() {
		page( purchasesPaths.list() );
	}

} );

export default connect(
	( state ) => {
		return {
			sitePurchases: getSitePurchases( state, getSelectedSiteId( state ) ),
			hasLoadedSitePurchasesFromServer: hasLoadedSitePurchasesFromServer( state )
		};
	}
)( DeleteSite );

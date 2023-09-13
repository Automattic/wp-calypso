import { isFreePlanProduct } from '@automattic/calypso-products';
import { Button, Dialog, Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import ActionPanel from 'calypso/components/action-panel';
import ActionPanelBody from 'calypso/components/action-panel/body';
import ActionPanelFigure from 'calypso/components/action-panel/figure';
import ActionPanelFooter from 'calypso/components/action-panel/footer';
import ActionPanelTitle from 'calypso/components/action-panel/title';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import HeaderCake from 'calypso/components/header-cake';
import Notice from 'calypso/components/notice';
import DeleteSiteWarningDialog from 'calypso/my-sites/site-settings/delete-site-warning-dialog';
import { hasLoadedSitePurchasesFromServer } from 'calypso/state/purchases/selectors';
import hasCancelableSitePurchases from 'calypso/state/selectors/has-cancelable-site-purchases';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { deleteSite } from 'calypso/state/sites/actions';
import { isTrialSite } from 'calypso/state/sites/plans/selectors';
import { getSite, getSiteDomain } from 'calypso/state/sites/selectors';
import { hasSitesAsLandingPage } from 'calypso/state/sites/selectors/has-sites-as-landing-page';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

import './style.scss';

class DeleteSite extends Component {
	static propTypes = {
		deleteSite: PropTypes.func.isRequired,
		hasLoadedSitePurchasesFromServer: PropTypes.bool,
		siteDomain: PropTypes.string,
		siteExists: PropTypes.bool,

		siteId: PropTypes.number,
		siteSlug: PropTypes.string,
		translate: PropTypes.func.isRequired,
		isTrialSite: PropTypes.bool,
	};

	state = {
		confirmDomain: '',
		showConfirmDialog: false,
		showWarningDialog: false,
	};

	renderNotice() {
		const { siteDomain, translate } = this.props;

		if ( ! siteDomain ) {
			return null;
		}

		return (
			<Notice status="is-warning" showDismiss={ false }>
				{ translate( '{{strong}}%(siteDomain)s{{/strong}} will be unavailable in the future.', {
					components: {
						strong: <strong />,
					},
					args: {
						siteDomain,
					},
				} ) }
			</Notice>
		);
	}

	handleDeleteSiteClick = ( event ) => {
		event.preventDefault();

		if ( ! this.props.hasLoadedSitePurchasesFromServer ) {
			return;
		}

		if ( this.props.hasCancelablePurchases ) {
			this.setState( { showWarningDialog: true } );
		} else {
			this.setState( { showConfirmDialog: true } );
		}
	};

	closeConfirmDialog = () => {
		this.setState( { showConfirmDialog: false, confirmDomain: '' } );
	};

	closeWarningDialog = () => {
		this.setState( { showWarningDialog: false } );
	};

	_goBack = () => {
		const { siteSlug } = this.props;
		page( '/settings/general/' + siteSlug );
	};

	componentDidUpdate( prevProps ) {
		const { siteId, siteExists, useSitesAsLandingPage } = this.props;

		if ( siteId && prevProps.siteExists && ! siteExists ) {
			this.props.setSelectedSiteId( null );
			if ( useSitesAsLandingPage ) {
				page.redirect( '/sites' );
			} else {
				page.redirect( '/' );
			}
		}
	}

	_deleteSite = () => {
		const { siteId } = this.props;

		this.setState( { showConfirmDialog: false } );

		this.props.deleteSite( siteId );
	};

	_checkSiteLoaded = ( event ) => {
		const { siteId } = this.props;
		if ( ! siteId ) {
			event.preventDefault();
		}
	};

	onConfirmDomainChange = ( event ) => {
		this.setState( {
			confirmDomain: event.target.value,
		} );
	};

	render() {
		const { isAtomic, isFreePlan, siteDomain, siteId, siteSlug, translate } = this.props;
		const exportLink = '/export/' + siteSlug;
		const deleteDisabled =
			typeof this.state.confirmDomain !== 'string' ||
			this.state.confirmDomain.toLowerCase().replace( /\s/g, '' ) !== siteDomain;
		const isAtomicRemovalInProgress = isFreePlan && isAtomic;

		const deleteButtons = [
			<Button onClick={ this.closeConfirmDialog }>{ translate( 'Cancel' ) }</Button>,
			<Button primary scary disabled={ deleteDisabled } onClick={ this._deleteSite }>
				{ translate( 'Delete this site' ) }
			</Button>,
		];

		const strings = {
			confirmDeleteSite: translate( 'Confirm delete site' ),
			contactSupport: translate( 'Contact support' ),
			deleteSite: translate( 'Delete site' ),
			exportContent: translate( 'Export content' ),
			exportContentFirst: translate( 'Export content first' ),
		};

		return (
			<div className="delete-site main main-column" role="main">
				{ siteId && <QuerySitePurchases siteId={ siteId } /> }
				<HeaderCake onClick={ this._goBack }>
					<h1>{ strings.deleteSite }</h1>
				</HeaderCake>
				<ActionPanel>
					<ActionPanelBody>
						<ActionPanelFigure>
							<svg
								width="158"
								height="174"
								viewBox="0 0 158 174"
								xmlns="http://www.w3.org/2000/svg"
							>
								<title>{ strings.exportContent }</title>
								<g transform="translate(0 -5)" fill="none" fillRule="evenodd">
									<rect fill="#D5E5EB" x="57" y="157" width="45" height="22" rx="4" />
									<text fontFamily="Open Sans" fontSize="11" fontWeight="526" fill="#FFF">
										<tspan x="69.736" y="172">
											.ZIP
										</tspan>
									</text>
									<path
										d="M89.5 131.5h-6v-9h-9v9h-6L79 142l10.5-10.5zm-21 13.5v3h21v-3h-21z"
										fill="#D5E5EB"
									/>
									<path d="M61 118h36v36H61v-36z" />
									<path
										d="M.03 40.992l54.486-29.92 25.18 13.238-54.62 29.734L.032 40.992z"
										fill="#D5E5EB"
									/>
									<path
										d="M157.9 40.992l-54.484-29.92-25.18 13.238 54.62 29.734L157.9 40.992z"
										fill="#D5E5EB"
									/>
									<path
										d="M118.9 43.846c0 21.098-17.186 38.266-38.304 38.266-21.118 0-38.303-17.168-38.303-38.266S59.478 5.58 80.596 5.58 118.9 22.748 118.9 43.846zM65.55 74.81L49.132 29.837a34.013 34.013 0 0 0-2.992 14.008c0 13.624 7.952 25.367 19.41 30.963zM101.2 53.24c1.495-4.783 2.65-8.2 2.65-11.147 0-4.23-1.54-7.175-2.864-9.48-1.71-2.82-3.378-5.21-3.378-8.072 0-3.16 2.394-6.108 5.772-6.108l.47.042c-6.114-5.594-14.278-9.052-23.256-9.052-12.012 0-22.614 6.19-28.77 15.502l2.223.042c3.59 0 9.148-.427 9.148-.427 1.88-.086 2.094 2.605.256 2.86 0 0-1.88.214-3.976.3l12.568 37.284 7.525-22.593-5.344-14.692c-1.88-.085-3.633-.298-3.633-.298-1.84-.128-1.625-2.947.214-2.86 0 0 5.685.425 9.063.425 3.633 0 9.19-.427 9.19-.427 1.838-.086 2.094 2.605.215 2.86 0 0-1.84.214-3.934.3l12.44 36.985 3.422-11.446zM92.01 76.304c-.085-.172-.17-.3-.213-.47l-10.603-29L70.85 76.86c3.12.895 6.37 1.365 9.746 1.365 4.02 0 7.865-.683 11.414-1.92zm19.024-45.44c0 3.5-.643 7.43-2.608 12.342L97.91 73.57c10.216-5.936 17.098-17.04 17.098-29.724 0-5.98-1.495-11.616-4.188-16.528a31.01 31.01 0 0 1 .214 3.546z"
										fill="#A8BECE"
									/>
									<path
										d="M133.263 53.938v37.715L79 113.728V76.014l54.263-22.076zM24.737 53.938v37.715L79 113.728V76.014L24.737 53.938z"
										fill="#D5E5EB"
									/>
									<path
										d="M155.74 70.355L102.527 92.48 78.125 75.12l55.24-21.407 22.374 16.642z"
										stroke="#FFF"
										strokeWidth="2.4"
										fill="#D5E5EB"
									/>
									<path
										d="M2.08 70.355L55.294 92.48l24.402-17.36-54.582-21.297L2.08 70.355z"
										stroke="#FFF"
										strokeWidth="2.4"
										fill="#D5E5EB"
									/>
								</g>
							</svg>
						</ActionPanelFigure>
						<ActionPanelTitle>{ strings.exportContentFirst }</ActionPanelTitle>
						<p>
							{ translate(
								'Before deleting your site, take a moment to export your content. ' +
									'This will package the content of all your posts and pages, ' +
									"along with your site's settings, into a .zip file. " +
									"If you ever want to re-create your site, you'll be able to import the .zip file to a new site."
							) }
						</p>
						<p>
							{ translate(
								'This content {{strong}}can not{{/strong}} be recovered once you delete this site.',
								{
									components: {
										strong: <strong />,
									},
								}
							) }
						</p>
					</ActionPanelBody>
					<ActionPanelFooter>
						<Button
							className="delete-site__export-button action-panel__export-button"
							disabled={ ! siteId }
							onClick={ this._checkSiteLoaded }
							href={ exportLink }
						>
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
							<h3 className="delete-site__content-list-header">
								{ translate( 'These items will be deleted' ) }
							</h3>
							<ul className="delete-site__content-list">
								<li className="delete-site__content-list-item">{ translate( 'Posts' ) }</li>
								<li className="delete-site__content-list-item">{ translate( 'Pages' ) }</li>
								<li className="delete-site__content-list-item">{ translate( 'Media' ) }</li>
								<li className="delete-site__content-list-item">
									{ translate( 'Users & Authors' ) }
								</li>
								<li className="delete-site__content-list-item">{ translate( 'Domains' ) }</li>
								<li className="delete-site__content-list-item">
									{ translate( 'Purchased Upgrades' ) }
								</li>
								<li className="delete-site__content-list-item">
									{ translate( 'Premium Themes' ) }
								</li>
							</ul>
						</ActionPanelFigure>
						<div>
							<p>
								{ translate(
									'Deletion {{strong}}can not{{/strong}} be undone, ' +
										'and will remove all content, contributors, domains, themes and upgrades from this site.',
									{
										components: {
											strong: <strong />,
										},
									}
								) }
							</p>
							<p>
								{ translate(
									"If you're unsure about what deletion means or have any other questions, " +
										'please chat with someone from our support team before proceeding.'
								) }
							</p>
							<p>
								<a
									className="delete-site__body-text-link action-panel__body-text-link"
									href="/help/contact"
								>
									{ strings.contactSupport }
								</a>
							</p>
						</div>
					</ActionPanelBody>
					{ isAtomicRemovalInProgress && (
						<p className="delete-site__cannot-delete-message">
							{ translate(
								"We are still in the process of removing your previous plan. Please check back in a few minutes and you'll be able to delete your site."
							) }
						</p>
					) }
					<ActionPanelFooter>
						<Button
							scary
							disabled={
								! siteId ||
								! this.props.hasLoadedSitePurchasesFromServer ||
								isAtomicRemovalInProgress
							}
							onClick={ this.handleDeleteSiteClick }
						>
							<Gridicon icon="trash" />
							{ strings.deleteSite }
						</Button>
					</ActionPanelFooter>
					<DeleteSiteWarningDialog
						isVisible={ this.state.showWarningDialog }
						onClose={ this.closeWarningDialog }
						isTrialSite={ this.props.isTrialSite }
					/>
					<Dialog
						isVisible={ this.state.showConfirmDialog }
						buttons={ deleteButtons }
						className="delete-site__confirm-dialog"
					>
						<h1 className="delete-site__confirm-header">{ strings.confirmDeleteSite }</h1>
						<FormLabel htmlFor="confirmDomainChangeInput" className="delete-site__confirm-label">
							{ translate(
								'Please type in {{warn}}%(siteAddress)s{{/warn}} in the field below to confirm. ' +
									'Your site will then be gone forever.',
								{
									components: {
										warn: <span className="delete-site__target-domain" />,
									},
									args: {
										siteAddress: siteId && siteDomain,
									},
								}
							) }
						</FormLabel>

						<FormTextInput
							autoCapitalize="off"
							className="delete-site__confirm-input"
							onChange={ this.onConfirmDomainChange }
							value={ this.state.confirmDomain }
							aria-required="true"
							id="confirmDomainChangeInput"
						/>
					</Dialog>
				</ActionPanel>
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const siteDomain = getSiteDomain( state, siteId );
		const siteSlug = getSelectedSiteSlug( state );
		const site = getSite( state, siteId );
		return {
			hasLoadedSitePurchasesFromServer: hasLoadedSitePurchasesFromServer( state ),
			isAtomic: isSiteAutomatedTransfer( state, siteId ),
			isFreePlan: isFreePlanProduct( site?.plan ),
			siteDomain,
			siteId,
			siteSlug,
			siteExists: !! getSite( state, siteId ),
			hasCancelablePurchases: hasCancelableSitePurchases( state, siteId ),
			useSitesAsLandingPage: hasSitesAsLandingPage( state ),
			isTrialSite: isTrialSite( state, siteId ),
		};
	},
	{
		deleteSite,
		setSelectedSiteId,
	}
)( localize( DeleteSite ) );

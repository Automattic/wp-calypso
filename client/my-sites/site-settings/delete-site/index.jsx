import { isFreePlanProduct } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import i18n, { getLocaleSlug, localize, translate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import ActionPanel from 'calypso/components/action-panel';
import ActionPanelBody from 'calypso/components/action-panel/body';
import ActionPanelFigure from 'calypso/components/action-panel/figure';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import FormTextInput from 'calypso/components/forms/form-text-input';
import HeaderCake from 'calypso/components/header-cake';
import InlineSupportLink from 'calypso/components/inline-support-link';
import NavigationHeader from 'calypso/components/navigation-header';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
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
import { getSettingsSource } from '../site-tools/utils';

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
		showWarningDialog: false,
	};

	renderNotice() {
		const exportLink = '/export/' + this.props.siteSlug;
		const { siteDomain } = this.props;

		if ( ! siteDomain ) {
			return null;
		}

		const warningText = () => {
			if (
				getLocaleSlug() === 'en' ||
				getLocaleSlug() === 'en-gb' ||
				i18n.hasTranslation(
					'Before deleting your site, consider exporting its content as a backup'
				)
			) {
				return translate( 'Before deleting your site, consider exporting its content as a backup' );
			}

			return translate( '{{strong}}%(siteDomain)s{{/strong}} will be unavailable in the future.', {
				components: {
					strong: <strong />,
				},
				args: {
					siteDomain,
				},
			} );
		};

		return (
			<Notice status="is-warning" showDismiss={ false } text={ warningText() }>
				<NoticeAction onClick={ this._checkSiteLoaded } href={ exportLink }>
					{ translate( 'Export content' ) }
				</NoticeAction>
			</Notice>
		);
	}

	renderDeleteSiteCTA() {
		const { isAtomic, isFreePlan, siteDomain } = this.props;
		const deleteDisabled =
			typeof this.state.confirmDomain !== 'string' ||
			this.state.confirmDomain.replace( /\s/g, '' ) !== siteDomain;
		const isAtomicRemovalInProgress = isFreePlan && isAtomic;

		let deletionText = translate(
			'Please type in {{warn}}%(siteAddress)s{{/warn}} in the field below to confirm. ' +
				'Your site will then be gone forever.',
			{
				components: {
					warn: <span className="delete-site__target-domain" />,
				},
				args: {
					siteAddress: this.props.siteId && this.props.siteDomain,
				},
			}
		);

		if (
			getLocaleSlug() === 'en' ||
			getLocaleSlug() === 'en-gb' ||
			i18n.hasTranslation( 'Before deleting your site, consider exporting its content as a backup' )
		) {
			deletionText = translate(
				'Type {{strong}}%(siteDomain)s{{/strong}} below to confirm you want to delete the site:',
				{
					components: {
						strong: <strong />,
					},
					args: {
						siteDomain: this.props.siteDomain,
					},
				}
			);
		}

		return (
			<>
				<p>{ deletionText }</p>
				<p className="delete-site__deletion-block">
					<FormTextInput
						autoCapitalize="off"
						className="delete-site__confirm-input"
						onChange={ this.onConfirmDomainChange }
						value={ this.state.confirmDomain }
						aria-required="true"
						id="confirmDomainChangeInput"
					/>
					<Button
						primary
						scary
						disabled={
							deleteDisabled ||
							! this.props.siteId ||
							! this.props.hasLoadedSitePurchasesFromServer ||
							isAtomicRemovalInProgress
						}
						onClick={ this.handleDeleteSiteClick }
					>
						{ translate( 'Delete site' ) }
					</Button>
				</p>
			</>
		);
	}

	renderBody() {
		if (
			getLocaleSlug() === 'en' ||
			getLocaleSlug() === 'en-gb' ||
			i18n.hasTranslation(
				'Deletion is {{strong}}irreversible and will permanently remove all site content{{/strong}} - posts, pages, media, users, authors, domains, purchased upgrades, and previum themes.'
			)
		) {
			return (
				<>
					<div>
						<p>
							{ translate(
								'Deletion is {{strong}}irreversible and will permanently remove all site content{{/strong}} - posts, pages, media, users, authors, domains, purchased upgrades, and previum themes.',
								{
									components: {
										strong: <strong />,
									},
								}
							) }
						</p>
						<p>
							{ translate(
								'Once deleted, your domain {{strong}}%(siteDomain)s{{/strong}} will also become unavailable.',
								{
									components: {
										strong: <strong />,
									},
									args: {
										siteDomain: this.props.siteDomain,
									},
								}
							) }
						</p>
					</div>
				</>
			);
		}

		return (
			<>
				<ActionPanelFigure>
					<h3 className="delete-site__content-list-header">
						{ translate( 'These items will be deleted' ) }
					</h3>
					<ul className="delete-site__content-list">
						<li className="delete-site__content-list-item">{ translate( 'Posts' ) }</li>
						<li className="delete-site__content-list-item">{ translate( 'Pages' ) }</li>
						<li className="delete-site__content-list-item">{ translate( 'Media' ) }</li>
						<li className="delete-site__content-list-item">{ translate( 'Users & Authors' ) }</li>
						<li className="delete-site__content-list-item">{ translate( 'Domains' ) }</li>
						<li className="delete-site__content-list-item">
							{ translate( 'Purchased Upgrades' ) }
						</li>
						<li className="delete-site__content-list-item">{ translate( 'Premium Themes' ) }</li>
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
							{ translate( 'Contact support' ) }
						</a>
					</p>
				</div>
			</>
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
			const { siteId } = this.props;
			this.props.deleteSite( siteId );
		}
	};

	closeWarningDialog = () => {
		this.setState( { showWarningDialog: false } );
	};

	_goBack = () => {
		const { siteSlug } = this.props;
		const source = getSettingsSource();
		page( `${ source }/${ siteSlug }` );
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
		const { isAtomic, isFreePlan, siteId } = this.props;
		const isAtomicRemovalInProgress = isFreePlan && isAtomic;

		const strings = {
			confirmDeleteSite: translate( 'Confirm delete site' ),
			deleteSite: translate( 'Delete site' ),
			exportContent: translate( 'Export content' ),
			exportContentFirst: translate( 'Export content first' ),
		};

		return (
			<div className="delete-site main main-column" role="main">
				<NavigationHeader
					compactBreadcrumb={ false }
					navigationItems={ [] }
					mobileItem={ null }
					title={ translate( 'Delete Site' ) }
					subtitle={ translate(
						'Permanently delete your site and all of its content. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
						{
							components: {
								learnMoreLink: (
									<InlineSupportLink supportContext="delete_site" showIcon={ false } />
								),
							},
						}
					) }
				></NavigationHeader>
				{ siteId && <QuerySitePurchases siteId={ siteId } /> }
				<HeaderCake onClick={ this._goBack } className="delete-site__header-cake">
					<h1>{ strings.deleteSite }</h1>
				</HeaderCake>
				<ActionPanel>
					<ActionPanelBody>
						{ this.renderNotice() }
						{ this.renderBody() }
					</ActionPanelBody>
					{ isAtomicRemovalInProgress && (
						<p className="delete-site__cannot-delete-message">
							{ translate(
								"We are still in the process of removing your previous plan. Please check back in a few minutes and you'll be able to delete your site."
							) }
						</p>
					) }
					{ this.renderDeleteSiteCTA() }
					<DeleteSiteWarningDialog
						isVisible={ this.state.showWarningDialog }
						onClose={ this.closeWarningDialog }
						isTrialSite={ this.props.isTrialSite }
					/>
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

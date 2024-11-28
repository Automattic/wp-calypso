import { isFreePlanProduct } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import i18n, { getLocaleSlug, localize, translate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import FormTextInput from 'calypso/components/forms/form-text-input';
import HeaderCakeBack from 'calypso/components/header-cake/back';
import InlineSupportLink from 'calypso/components/inline-support-link';
import NavigationHeader from 'calypso/components/navigation-header';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { Panel, PanelHeading, PanelSection } from 'calypso/components/panel';
import withP2HubP2Count from 'calypso/data/p2/with-p2-hub-p2-count';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getSettingsSource } from 'calypso/my-sites/site-settings/site-tools/utils';
import { hasLoadedSitePurchasesFromServer } from 'calypso/state/purchases/selectors';
import hasCancelableSitePurchases from 'calypso/state/selectors/has-cancelable-site-purchases';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { deleteSite } from 'calypso/state/sites/actions';
import { isTrialSite } from 'calypso/state/sites/plans/selectors';
import { getSite, getSiteDomain } from 'calypso/state/sites/selectors';
import { hasSitesAsLandingPage } from 'calypso/state/sites/selectors/has-sites-as-landing-page';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { isHostingMenuUntangled } from '../../../utils';
import DeleteSiteWarnings from './delete-site-warnings';

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
		isDeletingSite: false,
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
				<>
					<FormTextInput
						autoCapitalize="off"
						className="delete-site__confirm-input"
						onChange={ this.onConfirmDomainChange }
						value={ this.state.confirmDomain }
						aria-required="true"
					/>
					<Button
						primary
						scary
						busy={ this.state.isDeletingSite }
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
				</>
			</>
		);
	}

	renderBody() {
		return (
			<>
				<div>
					<p>
						{ translate(
							'Deletion is {{strong}}irreversible and will permanently remove all site content{{/strong}} — posts, pages, media, users, authors, domains, purchased upgrades, and premium themes.',
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

	handleDeleteSiteClick = async () => {
		if ( ! this.props.hasLoadedSitePurchasesFromServer ) {
			return;
		}

		recordTracksEvent( 'calypso_settings_delete_site_options', {
			option: 'delete-site',
		} );

		try {
			this.setState( { isDeletingSite: true } );
			await this.props.deleteSite( this.props.siteId );
			page.redirect( '/sites' );
		} finally {
			this.setState( { isDeletingSite: false } );
		}
	};

	_goBack = () => {
		const { siteSlug } = this.props;
		const source = isHostingMenuUntangled()
			? '/sites/settings/administration'
			: getSettingsSource();

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
		const { isAtomic, isFreePlan, siteId, hasCancelablePurchases, p2HubP2Count } = this.props;
		const isAtomicRemovalInProgress = isFreePlan && isAtomic;
		const canDeleteSite =
			! isAtomicRemovalInProgress && ! hasCancelablePurchases && p2HubP2Count === 0;
		const strings = {
			confirmDeleteSite: translate( 'Confirm delete site' ),
			deleteSite: translate( 'Delete site' ),
			exportContent: translate( 'Export content' ),
			exportContentFirst: translate( 'Export content first' ),
		};
		const isUntangled = isHostingMenuUntangled();

		return (
			<Panel className="settings-administration__delete-site">
				<HeaderCakeBack icon="chevron-left" onClick={ this._goBack } />
				<NavigationHeader
					compactBreadcrumb={ false }
					navigationItems={ [] }
					mobileItem={ null }
					title={ strings.deleteSite }
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
				{ canDeleteSite ? (
					<PanelSection>
						<>
							{ isUntangled && (
								<PanelHeading>{ translate( 'Confirm site deletion' ) }</PanelHeading>
							) }
							{ this.renderNotice() }
							{ this.renderBody() }
						</>
						{ this.renderDeleteSiteCTA() }
					</PanelSection>
				) : (
					<DeleteSiteWarnings
						isAtomicRemovalInProgress={ isAtomicRemovalInProgress }
						p2HubP2Count={ this.props.p2HubP2Count }
						isTrialSite={ this.props.isTrialSite }
					/>
				) }
			</Panel>
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
)( localize( withP2HubP2Count( DeleteSite ) ) );

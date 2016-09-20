/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import url from 'url';
import config from 'config';
import { connect } from 'react-redux';
import classNames from 'classnames';
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import { userCan } from 'lib/site/utils';
import paths from 'my-sites/upgrades/paths';
import { hasDomainCredit } from 'state/sites/plans/selectors';

import { isJetpackSite } from 'state/sites/selectors';
import {
	getUpdatesBySiteId,
	hasUpdates as siteHasUpdate,
	getSectionsToUpdate,
} from 'state/sites/updates/selectors';

import { canCurrentUser } from 'state/current-user/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import QuerySitePlans from 'components/data/query-site-plans';
import { isFinished as isJetpackPluginsFinished } from 'state/plugins/premium/selectors';
import TrackComponentView from 'lib/analytics/track-component-view';

import JetpackUpdatesPopover from 'blocks/jetpack-updates-popover';
import {
	renderPluginsTemplate,
	renderThemesTemplate,
	renderWPComTemplate,
} from 'blocks/jetpack-updates-popover/update-templates';

const debug = debugFactory( 'calypso:current-site:notice' );

const SiteNotice = React.createClass( {
	propTypes: {
		site: PropTypes.object,
		isJetpack: PropTypes.bool,
		hasUpdates: PropTypes.bool,
		updates: PropTypes.object
	},

	getDefaultProps() {
		return {
		};
	},

	getInitialState() {
		return {
			showJetpackPopover: false
		};
	},

	getSiteRedirectNotice: function( site ) {
		if ( ! site ) {
			return null;
		}
		if ( ! ( site.options && site.options.is_redirect ) ) {
			return null;
		}
		const { hostname } = url.parse( site.URL );

		return (
			<Notice
				showDismiss={ false }
				icon="info-outline"
				isCompact
			>
				{ this.translate( 'Redirects to {{a}}%(url)s{{/a}}', {
					args: { url: hostname },
					components: { a: <a href={ site.URL } /> }
				} ) }
				<NoticeAction href={ paths.domainManagementList( site.domain ) }>
					{ this.translate( 'Edit' ) }
				</NoticeAction>
			</Notice>
		);
	},

	domainCreditNotice() {
		if ( ! this.props.hasDomainCredit || ! this.props.canManageOptions ) {
			return null;
		}

		const eventName = 'calypso_domain_credit_reminder_impression';
		const eventProperties = { cta_name: 'current_site_domain_notice' };
		return (
			<Notice isCompact status="is-success" icon="info-outline">
				{ this.translate( 'Free domain available' ) }
				<NoticeAction
					onClick={ this.props.clickClaimDomainNotice }
					href={ `/domains/add/${ this.props.site.slug }` }
				>
					{ this.translate( 'Claim' ) }
					<TrackComponentView eventName={ eventName } eventProperties={ eventProperties } />
				</NoticeAction>
			</Notice>
		);
	},

	jetpackPluginsSetupNotice() {
		if ( ! this.props.pausedJetpackPluginsSetup || this.props.site.plan.product_slug === 'jetpack_free' ) {
			return null;
		}

		return (
			<Notice isCompact status="is-info" icon="plugins">
				{ this.translate(
					'Your %(plan)s plan needs setting up!',
					{ args: { plan: this.props.site.plan.product_name_short } }
				) }
				<NoticeAction href={ `/plugins/setup/${ this.props.site.slug }` } >
					{ this.translate( 'Finish' ) }
				</NoticeAction>
			</Notice>
		);
	},

	toggleJetpackNotificatonsPopover() {
		this.setState( { showJetpackPopover: ! this.state.showJetpackPopover } );
	},

	hideJetpackNotificatonsPopover() {
		this.setState( { showJetpackPopover: false } );
	},

	renderJetpackNotifications() {
		const { isJetpack, hasUpdates, sectionsToUpdate, site, updates } = this.props;
		const { showJetpackPopover } = this.state;

		if ( ! isJetpack ) {
			return debug( 'No Jetpack site' );
		}

		if ( ! userCan( 'manage_options', site ) ) {
			return debug( 'User can\'t manage options' );
		}

		if ( ! hasUpdates ) {
			return debug( '%s doesn\'t have updates', site.ID );
		}

		let title;

		if ( sectionsToUpdate.length > 1 ) {
			title = this.translate(
				'There is an update available.',
				'There are updates available.',
				{ count: updates.total }
			);
		} else if ( sectionsToUpdate.length === 1 ) {
			switch ( sectionsToUpdate[ 0 ] ) {
				case 'plugins':
					title = renderPluginsTemplate( this.props );
					break;

				case 'themes':
					title = renderThemesTemplate( this.props );
					break;

				case 'wordpress':
					title = renderWPComTemplate( this.props );
					break;
			}
		}

		return (
			<div ref="popoverJetpackNotifications">
				<Notice
					isCompact
					status="is-warning"
					icon="info-outline"
					onClick={ this.toggleJetpackNotificatonsPopover }
				>
					{ title }
				</Notice>

				{ sectionsToUpdate.length > 1 &&
					<JetpackUpdatesPopover
						site={ site }
						className="current-site__jetpack-updates-popover"
						id="popover__jetpack-notifications"
						isVisible={ showJetpackPopover }
						onClose={ this.hideJetpackNotificatonsPopover }
						position="bottom"
						context={ this.refs && this.refs.popoverJetpackNotifications }
					/>
				}
			</div>
		);
	},

	render() {
		const { site, sectionsToUpdate } = this.props;
		if ( ! site ) {
			return <div className="site__notices" />;
		}

		return (
			<div
				className={ classNames(
					'site__notices',
					{ 'has-many-updates': sectionsToUpdate.length > 1 }
				) }
			>

				<QuerySitePlans siteId={ site.ID } />

				{ this.getSiteRedirectNotice( site ) }
				{ this.domainCreditNotice() }
				{ this.jetpackPluginsSetupNotice() }
				{
					config.isEnabled( 'gm2016/jetpack-plugin-updates-trashpickup' ) &&
					this.renderJetpackNotifications()
				}
			</div>
		);
	}
} );

export default connect( ( state, ownProps ) => {
	const siteId = ownProps.site && ownProps.site.ID ? ownProps.site.ID : null;
	return {
		isJetpack: isJetpackSite( state, siteId ),
		hasDomainCredit: hasDomainCredit( state, siteId ),
		hasUpdates: siteHasUpdate( state, siteId ),
		canManageOptions: canCurrentUser( state, siteId, 'manage_options' ),
		pausedJetpackPluginsSetup: ! isJetpackPluginsFinished( state, siteId ),
		updates: getUpdatesBySiteId( state, siteId ),
		sectionsToUpdate: getSectionsToUpdate( state, siteId ),
	};
}, ( dispatch ) => {
	return {
		clickClaimDomainNotice: () => dispatch( recordTracksEvent(
			'calypso_domain_credit_reminder_click', {
				cta_name: 'current_site_domain_notice'
			}
		) )
	};
} )( localize( SiteNotice ) );

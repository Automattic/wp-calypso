import { isEnabled } from '@automattic/calypso-config';
import { Gridicon } from '@automattic/components';
import { layout } from '@wordpress/icons';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import SiteIcon from 'calypso/blocks/site-icon';
import SiteIndicator from 'calypso/my-sites/site-indicator';
import { recordGoogleEvent, recordTracksEvent } from 'calypso/state/analytics/actions';
import isNavUnificationEnabled from 'calypso/state/selectors/is-nav-unification-enabled';
import isSiteP2Hub from 'calypso/state/selectors/is-site-p2-hub';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import isUnlaunchedSite from 'calypso/state/selectors/is-unlaunched-site';
import { getSite, getSiteSlug, isSitePreviewable } from 'calypso/state/sites/selectors';

import './style.scss';

const noop = () => {};

class Site extends Component {
	static defaultProps = {
		// onSelect callback
		onSelect: noop,
		// mouse event callbacks
		onMouseEnter: noop,
		onMouseLeave: noop,

		// Set a href attribute to the anchor
		href: null,

		// Choose to show the SiteIndicator
		indicator: true,

		// Mark as selected or not
		isSelected: false,

		homeLink: false,
		// if homeLink is enabled
		showHomeIcon: true,
		compact: false,

		isP2Hub: false,
		isSiteP2: false,

		isReskinned: false,
	};

	static propTypes = {
		href: PropTypes.string,
		externalLink: PropTypes.bool,
		indicator: PropTypes.bool,
		onSelect: PropTypes.func,
		onMouseEnter: PropTypes.func,
		onMouseLeave: PropTypes.func,
		isSelected: PropTypes.bool,
		isHighlighted: PropTypes.bool,
		site: PropTypes.object,
		siteId: PropTypes.number,
		homeLink: PropTypes.bool,
		showHomeIcon: PropTypes.bool,
		compact: PropTypes.bool,
		isP2Hub: PropTypes.bool,
		isSiteP2: PropTypes.bool,
		isReskinned: PropTypes.bool,
	};

	onSelect = ( event ) => {
		this.props.onSelect( event, this.props.site.ID );
	};

	onMouseEnter = ( event ) => {
		this.props.onMouseEnter( event, this.props.site.ID );
	};

	onMouseLeave = ( event ) => {
		this.props.onMouseLeave( event, this.props.site.ID );
	};

	onViewSiteClick = ( event ) => {
		const { isPreviewable, siteSlug } = this.props;

		if ( ! isPreviewable ) {
			this.props.recordTracksEvent( 'calypso_mysites_sidebar_view_site_unpreviewable_clicked' );
			this.props.recordGoogleEvent( 'Sidebar', 'Clicked View Site | Unpreviewable' );
			return;
		}

		if ( event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ) {
			this.props.recordTracksEvent( 'calypso_mysites_sidebar_view_site_modifier_clicked' );
			this.props.recordGoogleEvent( 'Sidebar', 'Clicked View Site | Modifier Key' );
			return;
		}

		event.preventDefault();
		this.props.recordTracksEvent( 'calypso_mysites_sidebar_view_site_clicked' );
		this.props.recordGoogleEvent( 'Sidebar', 'Clicked View Site | Calypso' );
		page( '/view/' + siteSlug );
	};

	renderSiteDomain = () => {
		const { site, homeLink, translate } = this.props;
		return (
			<div className="site__domain">
				{ /* eslint-disable-next-line no-nested-ternary */ }
				{ this.props.isNavUnificationEnabled && ! isEnabled( 'jetpack-cloud' )
					? site.domain
					: homeLink
					? translate( 'View %(domain)s', {
							args: { domain: site.domain },
					  } )
					: site.domain }
			</div>
		);
	};

	render() {
		const { isSiteUnlaunched, site, translate } = this.props;

		if ( ! site ) {
			// we could move the placeholder state here
			return null;
		}

		// Note: Update CSS selectors in SiteSelector.scrollToHighlightedSite() if the class names change.
		const siteClass = classnames( {
			site: true,
			'is-jetpack': site.jetpack,
			'is-primary': site.primary,
			'is-private': site.is_private,
			'is-redirect': site.options && site.options.is_redirect,
			'is-selected': this.props.isSelected,
			'is-highlighted': this.props.isHighlighted,
			'is-compact': this.props.compact,
			'is-reskinned': this.props.isReskinned,
		} );

		// We show public coming soon badge only when the site is not private.
		// Check for `! site.is_private` to ensure two Coming Soon badges don't appear while we introduce public coming soon.
		const shouldShowPublicComingSoonSiteBadge = ! site.is_private && this.props.site.is_coming_soon;

		// Cover the coming Soon v1 cases for sites still unlaunched and/or in Coming Soon private by default.
		// isPrivateAndUnlaunched means it is an unlaunched coming soon v1 site
		const isPrivateAndUnlaunched = site.is_private && isSiteUnlaunched;
		const shouldShowPrivateByDefaultComingSoonBadge =
			this.props.site.is_coming_soon || isPrivateAndUnlaunched;

		return (
			<div className={ siteClass }>
				<a
					className="site__content"
					href={ this.props.homeLink ? site.URL : this.props.href }
					data-tip-target={ this.props.tipTarget }
					target={ this.props.externalLink && '_blank' }
					title={
						this.props.homeLink
							? translate( 'View %(domain)s', {
									args: { domain: site.domain },
							  } )
							: site.domain
					}
					onClick={ this.props.homeLink ? this.onViewSiteClick : this.onSelect }
					onMouseEnter={ this.onMouseEnter }
					onMouseLeave={ this.onMouseLeave }
					aria-label={
						this.props.homeLink
							? translate( 'View %(domain)s', {
									args: { domain: site.domain },
							  } )
							: site.domain
					}
				>
					<SiteIcon
						defaultIcon={ this.props.isReskinned ? layout : null }
						site={ site }
						// eslint-disable-next-line no-nested-ternary
						size={ this.props.compact ? 24 : this.props.isReskinned ? 50 : 32 }
					/>
					<div className="site__info">
						<div className="site__title">{ site.title }</div>
						{ ! this.props.isReskinned && this.renderSiteDomain() }
						{ /* eslint-disable wpcalypso/jsx-gridicon-size */ }
						{ this.props.isSiteP2 && ! this.props.isP2Hub && (
							<span className="site__badge is-p2">P2</span>
						) }
						{ this.props.isP2Hub && (
							<span className="site__badge is-p2-workspace">P2 Workspace</span>
						) }
						{ this.props.site.is_private && (
							<span className="site__badge site__badge-private">
								{ shouldShowPrivateByDefaultComingSoonBadge
									? translate( 'Coming Soon' )
									: translate( 'Private' ) }
							</span>
						) }
						{ site.options && site.options.is_difm_lite_in_progress && (
							<span className="site__badge site__badge-domain-only">
								{ translate( 'Do It For Me' ) }
							</span>
						) }
						{ shouldShowPublicComingSoonSiteBadge && (
							<span className="site__badge site__badge-coming-soon">
								{ translate( 'Coming Soon' ) }
							</span>
						) }
						{ site.options && site.options.is_redirect && (
							<span className="site__badge site__badge-redirect">{ translate( 'Redirect' ) }</span>
						) }
						{ site.options && site.options.is_domain_only && (
							<span className="site__badge site__badge-domain-only">{ translate( 'Domain' ) }</span>
						) }
						{ this.props.isReskinned && this.renderSiteDomain() }
						{ /* eslint-enable wpcalypso/jsx-gridicon-size */ }
					</div>
					{ this.props.homeLink && this.props.showHomeIcon && (
						<span className="site__home">
							<Gridicon icon="house" size={ 18 } />
						</span>
					) }
				</a>
				{ this.props.indicator && isEnabled( 'site-indicator' ) ? (
					<SiteIndicator site={ site } />
				) : null }
			</div>
		);
	}
}

function mapStateToProps( state, ownProps ) {
	const siteId = ownProps.siteId || ownProps.site.ID;
	const site = siteId ? getSite( state, siteId ) : ownProps.site;

	return {
		siteId,
		site,
		isPreviewable: isSitePreviewable( state, siteId ),
		siteSlug: getSiteSlug( state, siteId ),
		isSiteUnlaunched: isUnlaunchedSite( state, siteId ),
		isNavUnificationEnabled: isNavUnificationEnabled( state ),
		isSiteP2: isSiteWPForTeams( state, siteId ),
		isP2Hub: isSiteP2Hub( state, siteId ),
	};
}

export default connect( mapStateToProps, {
	recordGoogleEvent,
	recordTracksEvent,
} )( localize( Site ) );

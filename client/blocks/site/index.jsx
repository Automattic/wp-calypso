import { isEnabled } from '@automattic/calypso-config';
import { Gridicon } from '@automattic/components';
import { Icon, chevronDown } from '@wordpress/icons';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import SiteIcon from 'calypso/blocks/site-icon';
import SiteIndicator from 'calypso/my-sites/site-indicator';
import SitesMigrationTrialBadge from 'calypso/sites-dashboard/components/sites-migration-trial-badge';
import SitesStagingBadge from 'calypso/sites-dashboard/components/sites-staging-badge';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteP2Hub from 'calypso/state/selectors/is-site-p2-hub';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import isUnlaunchedSite from 'calypso/state/selectors/is-unlaunched-site';
import {
	getDomainsBySiteId,
	hasLoadedSiteDomains,
	isRequestingSiteDomains,
} from 'calypso/state/sites/domains/selectors';
import { isTrialSite } from 'calypso/state/sites/plans/selectors';
import { getSite, getSiteOption } from 'calypso/state/sites/selectors';

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

		showChevronDownIcon: false,

		isP2Hub: false,
		isSiteP2: false,
		defaultIcon: null,
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
		showChevronDownIcon: PropTypes.bool,
		isP2Hub: PropTypes.bool,
		isSiteP2: PropTypes.bool,
		defaultIcon: PropTypes.node,
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

	renderSiteDomain = () => {
		const { site, customDomains, isLoadingDomains } = this.props;

		if ( isLoadingDomains ) {
			return <div className="site__domain is-loading" />;
		}

		const siteDomain = customDomains.length > 0 ? customDomains[ 0 ].domain : site.domain;

		return <div className="site__domain">{ siteDomain }</div>;
	};

	renderSiteBadges() {
		const { isSiteUnlaunched, site, translate, isAtomicAndEditingToolkitDeactivated } = this.props;

		// We show public coming soon badge only when the site is not private.
		// Check for `! site.is_private` to ensure two Coming Soon badges don't appear while we introduce public coming soon.
		const shouldShowPublicComingSoonSiteBadge =
			! site.is_private &&
			this.props.site.is_coming_soon &&
			! isAtomicAndEditingToolkitDeactivated &&
			! this.props.isTrialSite;

		// Cover the coming Soon v1 cases for sites still unlaunched and/or in Coming Soon private by default.
		// isPrivateAndUnlaunched means it is an unlaunched coming soon v1 site
		const isPrivateAndUnlaunched = site.is_private && isSiteUnlaunched;
		const shouldShowPrivateByDefaultComingSoonBadge =
			this.props.site.is_coming_soon || isPrivateAndUnlaunched;

		return (
			<>
				{ this.props.isSiteP2 && ! this.props.isP2Hub && (
					<span className="site__badge is-p2">P2</span>
				) }
				{ site?.is_wpcom_staging_site && (
					<SitesStagingBadge className="site__badge" secondary>
						{ translate( 'Staging' ) }
					</SitesStagingBadge>
				) }
				{ this.props.isTrialSite && (
					<SitesMigrationTrialBadge className="site__badge" secondary>
						{ translate( 'Trial' ) }
					</SitesMigrationTrialBadge>
				) }
				{ this.props.isP2Hub && <span className="site__badge is-p2-workspace">P2 Workspace</span> }
				{ this.props.site.is_private && (
					<span className="site__badge site__badge-private">
						{ shouldShowPrivateByDefaultComingSoonBadge
							? translate( 'Coming Soon' )
							: translate( 'Private' ) }
					</span>
				) }
				{ site.options && site.options.is_difm_lite_in_progress && (
					<span className="site__badge site__badge-domain-only">
						{ translate( 'Express Service' ) }
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
			</>
		);
	}

	render() {
		const { site } = this.props;

		if ( ! site ) {
			// we could move the placeholder state here
			return null;
		}

		// Note: Update CSS selectors in SiteSelector.scrollToHighlightedSite() if the class names change.
		const siteClass = clsx( {
			site: true,
			'is-jetpack': site.jetpack,
			'is-primary': site.primary,
			'is-private': site.is_private,
			'is-redirect': site.options && site.options.is_redirect,
			'is-selected': this.props.isSelected,
			'is-highlighted': this.props.isHighlighted,
			'is-trial': this.props.isTrialSite,
		} );

		return (
			<div className={ siteClass }>
				<a
					className="site__content"
					href={ this.props.href }
					data-tip-target={ this.props.tipTarget }
					target={ this.props.externalLink && '_blank' }
					title={ site.domain }
					onClick={ this.onSelect }
					onMouseEnter={ this.onMouseEnter }
					onMouseLeave={ this.onMouseLeave }
					aria-label={ site.domain }
				>
					<SiteIcon
						// eslint-disable-next-line wpcalypso/jsx-gridicon-size
						defaultIcon={ this.props.defaultIcon || <Gridicon icon="globe" size={ 28 } /> }
						site={ site }
						size={ 32 }
					/>
					<div className="site__info">
						{ ! this.props.showChevronDownIcon ? (
							<div className="site__title">{ site.title }</div>
						) : (
							<div className="site__title-with-chevron-icon">
								<span className="site__title">{ site.title }</span>
								<span className="site__title-chevron-icon">
									<Icon icon={ chevronDown } size={ 24 } />
								</span>
							</div>
						) }
						{ this.renderSiteDomain() }
						{ this.renderSiteBadges() }
					</div>
				</a>
				{ this.props.indicator && isEnabled( 'site-indicator' ) ? (
					<SiteIndicator site={ site } />
				) : null }
			</div>
		);
	}
}

function mapStateToProps( state, ownProps ) {
	const siteId = ownProps.siteId || ownProps.site?.ID;
	const site = siteId ? getSite( state, siteId ) : ownProps.site;
	const siteDomains = getDomainsBySiteId( state, siteId );
	const customDomains = siteDomains.filter( ( domain ) => ! domain.isWPCOMDomain );
	const isLoadingDomains =
		! hasLoadedSiteDomains( state, siteId ) && isRequestingSiteDomains( state, siteId );
	return {
		siteId,
		site,
		customDomains,
		isLoadingDomains,
		isSiteUnlaunched: isUnlaunchedSite( state, siteId ),
		isSiteP2: isSiteWPForTeams( state, siteId ),
		isP2Hub: isSiteP2Hub( state, siteId ),
		isTrialSite: isTrialSite( state, siteId ),
		isAtomicAndEditingToolkitDeactivated:
			isAtomicSite( state, siteId ) &&
			getSiteOption( state, siteId, 'editing_toolkit_is_active' ) === false,
	};
}

export default connect( mapStateToProps, {
	recordTracksEvent,
} )( localize( Site ) );

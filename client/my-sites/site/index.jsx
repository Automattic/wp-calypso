/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import SiteIcon from 'components/site-icon';
import Gridicon from 'components/gridicon';
import SiteIndicator from 'my-sites/site-indicator';
import { getCustomizeUrl } from 'my-sites/themes/helpers';
import sitesList from 'lib/sites-list';
import { userCan } from 'lib/site/utils';
import Tooltip from 'components/tooltip';
import ExternalLink from 'components/external-link';
import analytics from 'lib/analytics';

const sites = sitesList();

export default React.createClass( {
	displayName: 'Site',

	getDefaultProps() {
		return {
			// onSelect callback
			onSelect: noop,
			onClick: noop,
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
			enableActions: false,
			disableStarring: true
		};
	},

	propTypes: {
		href: React.PropTypes.string,
		externalLink: React.PropTypes.bool,
		indicator: React.PropTypes.bool,
		onSelect: React.PropTypes.func,
		onMouseEnter: React.PropTypes.func,
		onMouseLeave: React.PropTypes.func,
		isSelected: React.PropTypes.bool,
		site: React.PropTypes.object.isRequired,
		onClick: React.PropTypes.func,
		enableActions: React.PropTypes.bool,
		disableStarring: React.PropTypes.bool
	},

	getInitialState() {
		return {
			showActions: false,
			starTooltip: false,
			cogTooltip: false
		};
	},

	onSelect( event ) {
		if ( this.props.homeLink ) {
			return;
		}

		this.props.onSelect( event );
		event.preventDefault(); // this doesn't actually do anything...
	},

	starSite() {
		const site = this.props.site;
		sites.toggleStarred( site.ID );
	},

	enableStarTooltip() {
		this.setState( { starTooltip: true } );
	},

	disableStarTooltip() {
		this.setState( { starTooltip: false } );
	},

	enableCogTooltip() {
		this.setState( { cogTooltip: true } );
	},

	disableCogTooltip() {
		this.setState( { cogTooltip: false } );
	},

	renderStar() {
		const site = this.props.site;

		if ( ! site || this.props.disableStarring ) {
			return null;
		}

		const isStarred = sites.isStarred( site );

		return (
			<button
				className="site__star"
				onClick={ this.starSite }
				onMouseEnter={ this.enableStarTooltip }
				onMouseLeave={ this.disableStarTooltip }
				ref="starButton"
			>
				{ isStarred
					? <Gridicon icon="star" />
					: <Gridicon icon="star-outline" />
				}
				<Tooltip
					context={ this.refs && this.refs.starButton }
					isVisible={ this.state.starTooltip && ! isStarred }
					position="bottom"
				>
					{ this.translate( 'Star this site' ) }
				</Tooltip>
			</button>
		);
	},

	renderCog() {
		const site = this.props.site;

		if ( ! site ) {
			return null;
		}

		return (
			<a
				className="site__cog"
				href={ `/settings/general/${ site.slug }` }
				onMouseEnter={ this.enableCogTooltip }
				onMouseLeave={ this.disableCogTooltip }
				ref="cogButton"
			>
				<Gridicon icon="cog" />
				<Tooltip
					context={ this.refs && this.refs.cogButton }
					isVisible={ this.state.cogTooltip }
					position="bottom"
				>
					{ this.translate( 'Site settings' ) }
				</Tooltip>
			</a>
		);
	},

	renderEditIcon() {
		if ( ! userCan( 'manage_options', this.props.site ) ) {
			return <SiteIcon site={ this.props.site } />;
		}

		let url = getCustomizeUrl( null, this.props.site ) + '&autofocus[section]=title_tagline';

		if ( ! this.props.site.jetpack && this.props.site.options ) {
			url = this.props.site.options.admin_url + 'options-general.php';
		}

		return (
			<ExternalLink icon={ true } href={ url } target="_blank" className="site__edit-icon" onClick={ this.onEditIconClick }>
				<SiteIcon site={ this.props.site } />
				<span className="site__edit-icon-text">{ this.translate( 'Edit Icon' ) }</span>
			</ExternalLink>
		);
	},

	getHref() {
		if ( this.state.showMoreActions || ! this.props.site ) {
			return null;
		}

		return this.props.homeLink ? this.props.site.URL : this.props.href;
	},

	closeActions() {
		this.setState( { showMoreActions: false } );
	},

	toggleActions() {
		if ( ! this.state.showMoreActions ) {
			analytics.mc.bumpStat( 'calypso_site_card', 'toggle_button' );
		}
		this.setState( { showMoreActions: ! this.state.showMoreActions } );
	},

	onEditIconClick( event ) {
		const site = this.props.site;

		if ( event ) {
			analytics.mc.bumpStat( 'calypso_site_card', 'edit_icon' );
		}

		if ( event && site && ! site.icon ) {
			analytics.mc.bumpStat( 'calypso_site_card', 'edit_default_icon' );
		}
	},

	render() {
		const site = this.props.site;

		if ( ! site ) {
			// we could move the placeholder state here
			return null;
		}

		const siteClass = classnames( {
			site: true,
			'is-jetpack': site.jetpack,
			'is-primary': site.primary,
			'is-private': site.is_private,
			'is-redirect': site.options && site.options.is_redirect,
			'is-selected': this.props.isSelected,
			'is-toggled': this.state.showMoreActions,
			'has-edit-capabilities': userCan( 'manage_options', site )
		} );

		return (
			<div className={ siteClass }>
				{ ! this.state.showMoreActions
					? <a className="site__content"
							href={ this.props.homeLink ? site.URL : this.props.href }
							data-tip-target={ this.props.tipTarget }
							target={ this.props.externalLink && ! this.state.showMoreActions && '_blank' }
							title={ this.props.homeLink
								? this.translate( 'View "%(title)s"', { args: { title: site.title } } )
								: site.title
							}
							onTouchTap={ this.onSelect }
							onClick={ this.props.onClick }
							onMouseEnter={ this.props.onMouseEnter }
							onMouseLeave={ this.props.onMouseLeave }
							aria-label={ this.props.homeLink && site.is_previewable
								? this.translate( 'Open site %(domain)s in a preview', {
									args: { domain: site.domain }
								} )
								: this.translate( 'Open site %(domain)s in new tab', {
									args: { domain: site.domain }
								} )
							}
						>
							<SiteIcon site={ site } />
							<div className="site__info">
								<div className="site__title">
									{ this.props.site.is_private &&
										<span className="site__badge">
											<Gridicon icon="lock" size={ 14 } nonStandardSize />
										</span>
									}
									{ site.options && site.options.is_redirect &&
										<span className="site__badge">
											<Gridicon icon="block" size={ 14 } nonStandardSize />
										</span>
									}
									{ site.title }
								</div>
								<div className="site__domain">{ site.domain }</div>
							</div>
							{ this.props.homeLink &&
								<span className="site__home">
									<Gridicon icon="house" size={ 18 } />
								</span>
							}
							{ ! this.props.disableStarring && sites.isStarred( this.props.site ) &&
								<span className="site__badge">
									<Gridicon icon="star" size={ 18 } />
								</span>
							}
						</a>
					: <div className="site__content">
							{ this.renderEditIcon() }
							<div className="site__actions">
								{ this.renderStar() }
								{ this.renderCog() }
							</div>
						</div>
				}
				{ this.props.indicator
					? <SiteIndicator site={ site } onSelect={ this.props.onSelect } />
					: null
				}
				{ this.props.enableActions &&
					<button
						className="site__toggle-more-options"
						onClick={ this.toggleActions }
					>
						<Gridicon icon="ellipsis" size={ 24 } />
					</button>
				}
			</div>
		);
	}
} );

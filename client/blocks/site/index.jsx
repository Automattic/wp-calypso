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
import EllipsisMenu from 'components/ellipsis-menu';
import PopoverMenuItem from 'components/popover/menu-item';
import { getCustomizeUrl } from 'my-sites/themes/helpers';
import { userCan } from 'lib/site/utils';
import { isMobile } from 'lib/viewport';
import analytics from 'lib/analytics';

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
			enableActions: false
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
		enableActions: React.PropTypes.bool
	},

	onSelect( event ) {
		if ( this.props.homeLink ) {
			return;
		}

		this.props.onSelect( event );
		event.preventDefault(); // this doesn't actually do anything...
	},

	getEditIconUrl() {
		const { site } = this.props;

		if ( site.jetpack ) {
			return getCustomizeUrl( null, site ) + '&autofocus[section]=title_tagline';
		} else if ( site.options ) {
			return site.options.admin_url + 'options-general.php';
		}
	},

	toggleActions() {
		if ( ! this.hasTrackedActionToggle ) {
			this.hasTrackedActionToggle = true;
			analytics.mc.bumpStat( 'calypso_site_card', 'toggle_button' );
		}
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

	onSettingsClick( event ) {
		if ( event ) {
			analytics.mc.bumpStat( 'calypso_site_card', 'settings' );
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
			'is-selected': this.props.isSelected
		} );

		return (
			<div className={ siteClass }>
				<a
					className="site__content"
					href={ this.props.homeLink ? site.URL : this.props.href }
					data-tip-target={ this.props.tipTarget }
					target={ this.props.externalLink ? '_blank' : null }
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
					}>
					<SiteIcon site={ site } />
					<div className="site__info">
						<div className="site__title">
							{ /* eslint-disable wpcalypso/jsx-gridicon-size */ }
							{ this.props.site.is_private &&
								<span className="site__badge">
									<Gridicon icon="lock" size={ 14 } />
								</span>
							}
							{ site.options && site.options.is_redirect &&
								<span className="site__badge">
									<Gridicon icon="block" size={ 14 } />
								</span>
							}
							{ /* eslint-enable wpcalypso/jsx-gridicon-size */ }
							{ site.title }
						</div>
						<div className="site__domain">{ site.domain }</div>
					</div>
					{ this.props.homeLink &&
						<span className="site__home">
							<Gridicon icon="house" size={ 18 } />
						</span>
					}
				</a>
				{ this.props.indicator
					? <SiteIndicator site={ site } onSelect={ this.props.onSelect } />
					: null
				}
				{ this.props.enableActions && userCan( 'manage_options', this.props.site ) && (
					<EllipsisMenu
						onToggle={ this.toggleActions }
						position={ `bottom ${ isMobile() ? 'left' : 'right' }` }
						className="site__toggle-more-options">
						<PopoverMenuItem
							href={ `/settings/general/${ site.slug }` }
							onClick={ this.onSettingsClick }>
							{ this.translate( 'Site settings' ) }
						</PopoverMenuItem>
						<PopoverMenuItem
							href={ this.getEditIconUrl() }
							target="_blank"
							onClick={ this.onEditIconClick }>
							{ this.translate( 'Edit Icon' ) }
							<Gridicon
								icon="external"
								size={ 18 }
								className="site__edit-icon-external" />
						</PopoverMenuItem>
					</EllipsisMenu>
				) }
			</div>
		);
	}
} );

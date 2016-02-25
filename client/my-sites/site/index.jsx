/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' ),
	noop = require( 'lodash/noop' );

/**
 * Internal dependencies
 */
var SiteIcon = require( 'components/site-icon' ),
	Gridicon = require( 'components/gridicon' ),
	SiteIndicator = require( 'my-sites/site-indicator' ),
	getCustomizeUrl = require( 'my-sites/themes/helpers' ).getCustomizeUrl,
	sites = require( 'lib/sites-list' )();

import { userCan } from 'lib/site/utils';
import Tooltip from 'components/tooltip';
import ExternalLink from 'components/external-link';

module.exports = React.createClass( {
	displayName: 'Site',

	getDefaultProps: function() {
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

	getInitialState: function() {
		return {
			showActions: false,
			starTooltip: false
		};
	},

	onSelect: function( event ) {
		if ( this.props.homeLink ) {
			return;
		}

		this.props.onSelect( event );
		event.preventDefault(); // this doesn't actually do anything...
	},

	starSite: function() {
		const site = this.props.site;
		sites.toggleStarred( site.ID );
	},

	renderStar: function() {
		const site = this.props.site;

		if ( ! site || this.props.disableStarring ) {
			return null;
		}

		const isStarred = sites.isStarred( site );

		return (
			<button
				className="site__star"
				onClick={ this.starSite }
				onMouseEnter={ () => this.setState( { starTooltip: true } ) }
				onMouseLeave={ () => this.setState( { starTooltip: false } ) }
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

	renderEditIcon: function() {
		if ( ! userCan( 'manage_options', this.props.site ) ) {
			return <SiteIcon site={ this.props.site } />;
		}

		let url = getCustomizeUrl( null, this.props.site );

		if ( ! this.props.site.jetpack && this.props.site.options ) {
			url = this.props.site.options.admin_url + 'options-general.php';
		}

		return (
			<ExternalLink icon={ true } href={ url } target="_blank" className="site__edit-icon">
				<SiteIcon site={ this.props.site } />
				<span className="site__edit-icon-text">{ this.translate( 'Edit Icon' ) }</span>
			</ExternalLink>
		);
	},

	getHref: function() {
		if ( this.state.showMoreActions || ! this.props.site ) {
			return null;
		}

		return this.props.homeLink ? this.props.site.URL : this.props.href;
	},

	closeActions: function() {
		this.setState( { showMoreActions: false } );
	},

	render: function() {
		var site = this.props.site,
			siteClass;

		if ( ! site ) {
			// we could move the placeholder state here
			return null;
		}

		siteClass = classNames( {
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
				{ ! this.state.showMoreActions ?
					<a className="site__content"
						href={ this.props.homeLink ? site.URL : this.props.href }
						target={ this.props.externalLink && ! this.state.showMoreActions && '_blank' }
						title={ this.props.homeLink
							? this.translate( 'Visit "%(title)s"', { args: { title: site.title } } )
							: site.title
						}
						onTouchTap={ this.onSelect }
						onClick={ this.props.onClick }
						onMouseEnter={ this.props.onMouseEnter }
						onMouseLeave={ this.props.onMouseLeave }
						aria-label={
							this.translate( 'Open site %(domain)s in new tab', {
								args: { domain: site.domain }
							} )
						}
					>
						<SiteIcon site={ site } />
						<div className="site__info">
							<div className="site__title">
								{ this.props.site.is_private &&
									<span className="site__badge">
										<Gridicon icon="lock" size={ 14 } />
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
				:
					<div className="site__content">
						{ this.renderEditIcon() }
						<div className="site__actions">
							{ this.renderStar() }
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
						onClick={ () => this.setState( { showMoreActions: ! this.state.showMoreActions } ) }
					>
						<Gridicon icon="ellipsis" size={ 24 } />
					</button>
				}
			</div>
		);
	}
} );

/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import MasterbarItem from './item';
import SitesPopover from 'components/sites-popover';
import paths from 'lib/paths';
import viewport from 'lib/viewport';
import { preload } from 'sections-preload';

export default React.createClass( {
	displayName: 'MasterbarItemNew',

	propTypes: {
		user: React.PropTypes.object,
		sites: React.PropTypes.object,
		isActive: React.PropTypes.bool,
		className: React.PropTypes.string,
		tooltip: React.PropTypes.string,
	},

	getInitialState() {
		return {
			isShowingPopover: false
		};
	},

	setPostButtonContext( component ) {
		this.setState( {
			postButtonContext: component
		} );
	},

	toggleSitesPopover( isShowingPopover = ! this.state.isShowingPopover ) {
		// Setting state in the context of a touchTap event (i.e. SitePicker
		// Site onSelect) prevents link navigation from proceeding
		setTimeout( this.setState.bind( this, {
			isShowingPopover: isShowingPopover
		} ), 0 );
	},

	onClick( event ) {
		const visibleSiteCount = this.props.user.get().visible_site_count;

		// if multi-site and editor enabled, show site-selector
		if ( visibleSiteCount > 1 ) {
			this.toggleSitesPopover();
			event.preventDefault();
			return;
		}
	},

	getPopoverPosition() {
		if ( viewport.isMobile() ) {
			return 'bottom';
		}

		if ( this.props.user.isRTL() ) {
			return 'bottom right';
		}

		return 'bottom left';
	},

	render() {
		const classes = classNames( this.props.className );
		const currentSite = this.props.sites.getSelectedSite() || this.props.user.get().primarySiteSlug;
		const newPostPath = paths.newPost( currentSite );

		return (
			<MasterbarItem
				ref={ this.setPostButtonContext }
				url={ newPostPath }
				icon="create"
				onClick={ this.onClick }
				isActive={ this.props.isActive }
				tooltip={ this.props.tooltip }
				className={ classes }
				preloadSection={ () => preload( 'post-editor' ) }
			>
				{ this.props.children }
				<SitesPopover
					id="popover__sites-popover-masterbar"
					sites={ this.props.sites }
					visible={ this.state.isShowingPopover }
					context={ this.state.postButtonContext }
					onClose={ this.toggleSitesPopover.bind( this, false ) }
					groups={ true }
					position={ this.getPopoverPosition() } />
			</MasterbarItem>
		);
	}
} );

/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import MasterbarItem from './item';
import SitesPopover from 'components/sites-popover';
import paths from 'lib/paths';
import viewport from 'lib/viewport';
import { preload } from 'sections-preload';
import { getSelectedSite } from 'state/ui/selectors';
import AsyncLoad from 'components/async-load';

const MasterbarItemNew = React.createClass( {
	propTypes: {
		user: React.PropTypes.object,
		isActive: React.PropTypes.bool,
		className: React.PropTypes.string,
		tooltip: React.PropTypes.string,
		// connected props
		selectedSite: React.PropTypes.object,
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
		this.setState( { isShowingPopover } );
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
		const currentSite = this.props.selectedSite || this.props.user.get().primarySiteSlug;
		const newPostPath = paths.newPost( currentSite );

		return (
			<div className="masterbar__publish">
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
						visible={ this.state.isShowingPopover }
						context={ this.state.postButtonContext }
						onClose={ this.toggleSitesPopover.bind( this, false ) }
						groups={ true }
						position={ this.getPopoverPosition() } />
				</MasterbarItem>
				<AsyncLoad require="layout/masterbar/drafts" />
			</div>
		);
	}
} );

export default connect( ( state ) => {
	return { selectedSite: getSelectedSite( state ) };
} )( MasterbarItemNew );

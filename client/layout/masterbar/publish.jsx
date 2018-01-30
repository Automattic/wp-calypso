/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import MasterbarItem from './item';
import SitesPopover from 'components/sites-popover';
import { newPost } from 'lib/paths';
import { isMobile } from 'lib/viewport';
import { preload } from 'sections-preload';
import { getSelectedSite } from 'state/ui/selectors';
import MasterbarDrafts from './drafts';
import AsyncLoad from 'components/async-load';
import TranslatableString from 'components/translatable/proptype';

class MasterbarItemNew extends React.Component {
	static propTypes = {
		user: PropTypes.object,
		isActive: PropTypes.bool,
		className: PropTypes.string,
		tooltip: TranslatableString,
		// connected props
		selectedSite: PropTypes.object,
	};

	state = {
		isShowingPopover: false,
	};

	setPostButtonContext = component => {
		this.setState( {
			postButtonContext: component,
		} );
	};

	toggleSitesPopover = ( isShowingPopover = ! this.state.isShowingPopover ) => {
		this.setState( { isShowingPopover } );
	};

	onClick = event => {
		const visibleSiteCount = this.props.user.get().visible_site_count;

		// if multi-site and editor enabled, show site-selector
		if ( visibleSiteCount > 1 ) {
			this.toggleSitesPopover();
			event.preventDefault();
			return;
		}
	};

	getPopoverPosition = () => {
		if ( isMobile() ) {
			return 'bottom';
		}

		if ( this.props.user.isRTL() ) {
			return 'bottom right';
		}

		return 'bottom left';
	};

	render() {
		const classes = classNames( this.props.className );
		const currentSite = this.props.selectedSite || this.props.user.get().primarySiteSlug;
		const newPostPath = newPost( currentSite );

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
						onSiteSelect={ this.props.siteSelected }
						groups={ true }
						position={ this.getPopoverPosition() }
					/>
				</MasterbarItem>
				<MasterbarDrafts />
			</div>
		);
	}
}

const mapStateToProps = state => {
	return {
		selectedSite: getSelectedSite( state ),
	};
};

const mapDispatchToProps = dispatch => ( {
	siteSelected: () => {
		dispatch( recordTracksEvent( 'calypso_masterbar_write_button_clicked' ) );
	},
} );

export default connect( mapStateToProps, mapDispatchToProps )( MasterbarItemNew );

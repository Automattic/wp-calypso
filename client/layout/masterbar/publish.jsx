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
import { isRtl as isRtlSelector } from 'state/selectors';
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

	setPostButtonRef = component => {
		this.postButtonRef = component;
	};

	toggleSitesPopover = () => {
		this.setState( state => ( {
			isShowingPopover: ! state.isShowingPopover,
		} ) );
	};

	closeSitesPopover = () => {
		this.setState( { isShowingPopover: false } );
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

	preloadPostEditor = () => preload( 'post-editor' );

	getPopoverPosition() {
		const { isRtl } = this.props;

		if ( isMobile() ) {
			return 'bottom';
		}

		if ( isRtl ) {
			return 'bottom right';
		}

		return 'bottom left';
	}

	renderPopover() {
		if ( ! this.state.isShowingPopover ) {
			return null;
		}

		return (
			<SitesPopover
				id="popover__sites-popover-masterbar"
				visible
				groups
				context={ this.postButtonRef }
				onClose={ this.closeSitesPopover }
				onSiteSelect={ this.props.siteSelected }
				position={ this.getPopoverPosition() }
			/>
		);
	}

	render() {
		const classes = classNames( this.props.className );
		const currentSite = this.props.selectedSite || this.props.user.get().primarySiteSlug;
		const newPostPath = newPost( currentSite );

		return (
			<div className="masterbar__publish">
				<MasterbarItem
					ref={ this.setPostButtonRef }
					url={ newPostPath }
					icon="create"
					onClick={ this.onClick }
					isActive={ this.props.isActive }
					tooltip={ this.props.tooltip }
					className={ classes }
					preloadSection={ this.preloadPostEditor }
				>
					{ this.props.children }
					{ this.renderPopover() }
				</MasterbarItem>
				<MasterbarDrafts />
			</div>
		);
	}
}

const mapStateToProps = state => {
	return {
		selectedSite: getSelectedSite( state ),
		isRtl: isRtlSelector( state ),
	};
};

const mapDispatchToProps = dispatch => ( {
	siteSelected: () => {
		dispatch( recordTracksEvent( 'calypso_masterbar_write_button_clicked' ) );
	},
} );

export default connect( mapStateToProps, mapDispatchToProps )( MasterbarItemNew );

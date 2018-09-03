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
import { preload } from 'sections-helper';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import getPrimarySiteSlug from 'state/selectors/get-primary-site-slug';
import { getCurrentUserVisibleSiteCount } from 'state/current-user/selectors';
import MasterbarDrafts from './drafts';
import isRtlSelector from 'state/selectors/is-rtl';
import TranslatableString from 'components/translatable/proptype';

class MasterbarItemNew extends React.Component {
	static propTypes = {
		isActive: PropTypes.bool,
		className: PropTypes.string,
		tooltip: TranslatableString,
		// connected props
		currentSiteSlug: PropTypes.string,
		hasMoreThanOneVisibleSite: PropTypes.bool,
		isRtl: PropTypes.bool,
	};

	state = {
		isShowingPopover: false,
	};

	postButtonRef = React.createRef();

	toggleSitesPopover = () => {
		this.setState( state => ( {
			isShowingPopover: ! state.isShowingPopover,
		} ) );
	};

	closeSitesPopover = () => {
		this.setState( { isShowingPopover: false } );
	};

	onClick = event => {
		// if the user has multiple sites, show site selector
		if ( this.props.hasMoreThanOneVisibleSite ) {
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

	onSiteSelect = () => {
		this.props.recordTracksEvent( 'calypso_masterbar_write_button_clicked' );
		return false; // handledByHost = false, continue handling by navigating to /post/:site
	};

	renderPopover() {
		if ( ! this.state.isShowingPopover ) {
			return null;
		}

		return (
			<SitesPopover
				id="popover__sites-popover-masterbar"
				visible
				groups
				context={ this.postButtonRef.current }
				onClose={ this.closeSitesPopover }
				onSiteSelect={ this.onSiteSelect }
				position={ this.getPopoverPosition() }
			/>
		);
	}

	render() {
		const classes = classNames( this.props.className );
		const newPostPath = newPost( this.props.currentSiteSlug );

		return (
			<div className="masterbar__publish">
				<MasterbarItem
					ref={ this.postButtonRef }
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
		currentSiteSlug: getSelectedSiteSlug( state ) || getPrimarySiteSlug( state ),
		hasMoreThanOneVisibleSite: getCurrentUserVisibleSiteCount( state ) > 1,
		isRtl: isRtlSelector( state ),
	};
};

const mapDispatchToProps = { recordTracksEvent };

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( MasterbarItemNew );

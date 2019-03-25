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
import { recordTracksEvent, withAnalytics } from 'state/analytics/actions';
import MasterbarItem from './item';
import SitesPopover from 'components/sites-popover';
import { isMobile } from 'lib/viewport';
import { preload } from 'sections-helper';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getCurrentUserVisibleSiteCount } from 'state/current-user/selectors';
import MasterbarDrafts from './drafts';
import isRtlSelector from 'state/selectors/is-rtl';
import TranslatableString from 'components/translatable/proptype';
import { getEditorUrl } from 'state/selectors/get-editor-url';
import getPrimarySiteId from 'state/selectors/get-primary-site-id';
import { reduxGetState } from 'lib/redux-bridge';
import { navigate } from 'state/ui/actions';

class MasterbarItemNew extends React.Component {
	static propTypes = {
		isActive: PropTypes.bool,
		className: PropTypes.string,
		tooltip: TranslatableString,
		// connected props
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

	onSiteSelect = siteId => {
		const redirectUrl = getEditorUrl( reduxGetState(), siteId, null, 'post' );
		this.props.openEditor( redirectUrl );
		return true; // handledByHost = true, don't let the component nav
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
				isGutenbergOverride
			/>
		);
	}

	render() {
		const classes = classNames( this.props.className );

		return (
			<div className="masterbar__publish">
				<MasterbarItem
					ref={ this.postButtonRef }
					url={ this.props.editorUrl }
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
	const siteId = getSelectedSiteId( state ) || getPrimarySiteId( state );

	return {
		hasMoreThanOneVisibleSite: getCurrentUserVisibleSiteCount( state ) > 1,
		isRtl: isRtlSelector( state ),
		editorUrl: getEditorUrl( state, siteId, null, 'post' ),
	};
};

const mapDispatchToProps = dispatch => ( {
	openEditor: editorUrl =>
		dispatch(
			withAnalytics(
				recordTracksEvent( 'calypso_masterbar_write_button_clicked' ),
				navigate( editorUrl )
			)
		),
} );

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( MasterbarItemNew );

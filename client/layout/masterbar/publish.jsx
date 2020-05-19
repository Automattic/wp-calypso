/**
 * External dependencies
 */
import { isMobile } from '@automattic/viewport';
import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import AsyncLoad from 'components/async-load';
import { recordTracksEvent, withAnalytics } from 'state/analytics/actions';
import MasterbarItem from './item';
import { preload } from 'sections-helper';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getCurrentUserVisibleSiteCount } from 'state/current-user/selectors';
import MasterbarDrafts from './drafts';
import TranslatableString from 'components/translatable/proptype';
import { getEditorUrl } from 'state/selectors/get-editor-url';
import getPrimarySiteId from 'state/selectors/get-primary-site-id';
import getSectionGroup from 'state/ui/selectors/get-section-group';
import { reduxGetState } from 'lib/redux-bridge';
import { navigate } from 'state/ui/actions';

class MasterbarItemNew extends React.Component {
	static propTypes = {
		isActive: PropTypes.bool,
		className: PropTypes.string,
		tooltip: TranslatableString,
		// connected props
		shouldOpenSiteSelector: PropTypes.bool,
		editorUrl: PropTypes.string,
	};

	state = {
		isShowingPopover: false,
	};

	postButtonRef = React.createRef();

	toggleSitesPopover = () => {
		this.setState( ( state ) => ( {
			isShowingPopover: ! state.isShowingPopover,
		} ) );
	};

	closeSitesPopover = () => {
		this.setState( { isShowingPopover: false } );
	};

	onClick = ( event ) => {
		// if the user has multiple sites and none is selected, show site selector
		if ( this.props.shouldOpenSiteSelector ) {
			this.toggleSitesPopover();
			event.preventDefault();
		}
	};

	preloadPostEditor = () => preload( 'post-editor' );

	getPopoverPosition() {
		return isMobile() ? 'bottom' : 'bottom left';
	}

	onSiteSelect = ( siteId ) => {
		const redirectUrl = getEditorUrl( reduxGetState(), siteId, null, 'post' );
		this.props.openEditor( redirectUrl );
		return true; // handledByHost = true, don't let the component nav
	};

	renderPopover() {
		if ( ! this.state.isShowingPopover ) {
			return null;
		}

		return (
			<AsyncLoad
				require="components/sites-popover"
				placeholder={ null }
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
				</MasterbarItem>
				<MasterbarDrafts />
				{ this.renderPopover() }
			</div>
		);
	}
}

const openEditor = ( editorUrl ) =>
	withAnalytics(
		recordTracksEvent( 'calypso_masterbar_write_button_clicked' ),
		navigate( editorUrl )
	);

export default connect(
	( state ) => {
		const selectedSiteId = getSelectedSiteId( state );
		const isSitesGroup = getSectionGroup( state ) === 'sites';
		const hasMoreThanOneVisibleSite = getCurrentUserVisibleSiteCount( state ) > 1;

		// the selector is shown only if it's not 100% clear which site we are on.
		// I.e, when user has more than one site, is outside the My Sites group,
		// or has one of the All Sites views selected.
		const shouldOpenSiteSelector =
			! ( selectedSiteId && isSitesGroup ) && hasMoreThanOneVisibleSite;

		// otherwise start posting to the selected or primary site right away
		const siteId = selectedSiteId || getPrimarySiteId( state );
		const editorUrl = getEditorUrl( state, siteId, null, 'post' );

		return { shouldOpenSiteSelector, editorUrl };
	},
	{ openEditor }
)( MasterbarItemNew );

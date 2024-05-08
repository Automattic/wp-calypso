import { isMobile } from '@automattic/viewport';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { createRef, Component } from 'react';
import { connect } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import TranslatableString from 'calypso/components/translatable/proptype';
import { navigate } from 'calypso/lib/navigate';
import { preloadEditor } from 'calypso/sections-preloaders';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserVisibleSiteCount } from 'calypso/state/current-user/selectors';
import { getMyPostCount } from 'calypso/state/posts/counts/selectors';
import { getEditorUrl } from 'calypso/state/selectors/get-editor-url';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import getSectionGroup from 'calypso/state/ui/selectors/get-section-group';
import MasterbarDrafts from './drafts';
import MasterbarItem from './item';
import { WriteIcon } from './write-icon';

class MasterbarItemNew extends Component {
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

	postButtonRef = createRef();

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

	getPopoverPosition() {
		return isMobile() ? 'bottom' : 'bottom left';
	}

	onSiteSelect = ( siteId ) => {
		this.props.openEditorForSite( siteId );
		return true; // handledByHost = true, don't let the component nav
	};

	renderPopover() {
		if ( ! this.state.isShowingPopover ) {
			return null;
		}

		return (
			<AsyncLoad
				require="calypso/components/sites-popover"
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
		const classes = clsx( this.props.className, {
			'has-drafts': this.props.draftCount > 0,
		} );

		return (
			<div className="masterbar__publish">
				<MasterbarItem
					ref={ this.postButtonRef }
					url={ this.props.editorUrl }
					icon={ <WriteIcon /> }
					onClick={ this.onClick }
					isActive={ this.props.isActive }
					tooltip={ this.props.tooltip }
					className={ classes }
					preloadSection={ preloadEditor }
				>
					{ this.props.children }
				</MasterbarItem>
				<MasterbarDrafts draftCount={ this.props.draftCount } />
				{ this.renderPopover() }
			</div>
		);
	}
}

const openEditorForSite = ( siteId ) => ( dispatch, getState ) => {
	const redirectUrl = getEditorUrl( getState(), siteId, null, 'post' );
	dispatch( recordTracksEvent( 'calypso_masterbar_write_button_clicked' ) );
	navigate( redirectUrl );
};

export default connect(
	( state ) => {
		const selectedSiteId = getSelectedSiteId( state );
		const isSitesGroup = getSectionGroup( state ) === 'sites';
		const hasMoreThanOneVisibleSite = getCurrentUserVisibleSiteCount( state ) > 1;
		const draftCount = getMyPostCount( state, selectedSiteId, 'post', 'draft' );

		// the selector is shown only if it's not 100% clear which site we are on.
		// I.e, when user has more than one site, is outside the My Sites group,
		// or has one of the All Sites views selected.
		const shouldOpenSiteSelector =
			! ( selectedSiteId && isSitesGroup ) && hasMoreThanOneVisibleSite;

		// otherwise start posting to the selected or primary site right away
		const siteId = selectedSiteId || getPrimarySiteId( state );
		const editorUrl = getEditorUrl( state, siteId, null, 'post' );

		return { shouldOpenSiteSelector, editorUrl, draftCount };
	},
	{ openEditorForSite }
)( MasterbarItemNew );

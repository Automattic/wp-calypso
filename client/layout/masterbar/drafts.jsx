import { Button, Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import QueryPostCounts from 'calypso/components/data/query-post-counts';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const MasterbarDraftsPopover = ( props ) => (
	<AsyncLoad { ...props } require="calypso/layout/masterbar/drafts-popover" placeholder={ null } />
);

class MasterbarDrafts extends Component {
	static propTypes = {
		draftCount: PropTypes.number,
		numberFormat: PropTypes.func,
		selectedSiteId: PropTypes.number,
	};

	state = {
		showDrafts: false,
	};

	preloaded = false;

	// Preload the async chunk on mouse hover or touch start
	preload = () => {
		if ( this.preloaded ) {
			return;
		}

		asyncRequire( 'calypso/layout/masterbar/drafts-popover' );
		this.preloaded = true;
	};

	toggleDrafts = () => {
		this.setState( ( state ) => ( {
			showDrafts: ! state.showDrafts,
		} ) );
	};

	closeDrafts = () => {
		this.setState( { showDrafts: false } );
	};

	draftClicked = () => {
		this.props.recordTracksEvent( 'calypso_masterbar_draft_selected' );
		this.closeDrafts();
	};

	newDraftClicked = () => {
		this.props.recordTracksEvent( 'calypso_masterbar_drafts_new_draft_clicked' );
		this.closeDrafts();
	};

	seeAllDraftsClicked = () => {
		this.props.recordTracksEvent( 'calypso_masterbar_drafts_see_all_drafts_clicked' );
		this.closeDrafts();
	};

	setDraftsRef = ( el ) => {
		this.draftsRef = el;
	};

	renderButton() {
		if ( ! this.props.selectedSiteId || ! this.props.draftCount ) {
			return null;
		}

		return (
			<Button
				compact
				borderless
				className="masterbar__toggle-drafts"
				title={ this.props.translate( 'Latest Drafts' ) }
				onClick={ this.toggleDrafts }
				onTouchStart={ this.preload }
				onMouseEnter={ this.preload }
				ref={ this.setDraftsRef }
				aria-haspopup
				aria-expanded={ this.state.showDrafts || undefined }
			>
				<span className="masterbar__toggle-drafts-lg-label">
					{ this.props.numberFormat( this.props.draftCount ) }
				</span>

				{ /* Don't display draft count on small screens when the count has more than 2 digits */ }
				{ this.props.draftCount < 100 && (
					<span className="masterbar__toggle-drafts-sm-label">
						{ this.props.numberFormat( this.props.draftCount ) }
					</span>
				) }

				<Gridicon icon={ this.state.showDrafts ? 'chevron-up' : 'chevron-down' } />
			</Button>
		);
	}

	renderPopover() {
		if ( ! this.state.showDrafts ) {
			return null;
		}

		return (
			<MasterbarDraftsPopover
				siteId={ this.props.selectedSiteId }
				draftCount={ this.props.draftCount }
				context={ this.draftsRef }
				closeDrafts={ this.closeDrafts }
				draftClicked={ this.draftClicked }
				newDraftClicked={ this.newDraftClicked }
				seeAllDraftsClicked={ this.seeAllDraftsClicked }
			/>
		);
	}

	render() {
		if ( ! this.props.selectedSiteId ) {
			return null;
		}

		return (
			<div className="masterbar__drafts">
				<QueryPostCounts siteId={ this.props.selectedSiteId } type="post" />
				{ this.renderButton() }
				{ this.renderPopover() }
			</div>
		);
	}
}

export default connect(
	( state ) => ( {
		selectedSiteId: getSelectedSiteId( state ),
	} ),
	{ recordTracksEvent }
)( localize( MasterbarDrafts ) );

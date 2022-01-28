import { Button, Gridicon } from '@automattic/components';
import { withMobileBreakpoint } from '@automattic/viewport-react';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, Suspense, lazy } from 'react';
import { connect } from 'react-redux';
import QuerySupportTypes from 'calypso/blocks/inline-help/inline-help-query-support-types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import InlineHelpRichResult from './inline-help-rich-result';
import InlineHelpSearchCard from './inline-help-search-card';
import InlineHelpSearchResults from './inline-help-search-results';
import './popover-content.scss';

const VIEW_SEARCH = 'search';
const VIEW_CONTACT = 'contact';
const VIEW_RICH_RESULT = 'richresult';

const InlineHelpContactView = lazy( () => import( './inline-help-contact-view' ) );

function SearchView( { openResultView, setAdminSection, searchQuery, onSearch } ) {
	return (
		<section>
			<div className="inline-help__search">
				<InlineHelpSearchCard query={ searchQuery } onSearch={ onSearch } />
				<InlineHelpSearchResults
					onSelect={ openResultView }
					onAdminSectionSelect={ setAdminSection }
					searchQuery={ searchQuery }
				/>
			</div>
		</section>
	);
}

class InlineHelpPopoverContent extends Component {
	static propTypes = {
		onClose: PropTypes.func.isRequired,
		showVideoResult: PropTypes.func.isRequired,
	};

	state = {
		searchQuery: '',
		activeView: VIEW_SEARCH,
		selectedResult: null,
	};

	setSearchQuery = ( searchQuery ) => {
		this.setState( { searchQuery } );
	};

	openResultView = ( event, result ) => {
		event.preventDefault();
		this.setState( { selectedResult: result } );
		this.openSecondaryView( VIEW_RICH_RESULT );
	};

	setAdminSection = () => {
		const { isBreakpointActive: isMobile, onClose } = this.props;
		if ( ! isMobile ) {
			return;
		}
		onClose();
	};

	moreHelpClicked = () => {
		this.props.onClose();
		this.props.recordTracksEvent( 'calypso_inlinehelp_morehelp_click', {
			location: 'inline-help-popover',
		} );
	};

	openSecondaryView = ( secondaryViewKey ) => {
		this.props.recordTracksEvent( `calypso_inlinehelp_${ secondaryViewKey }_show`, {
			location: 'inline-help-popover',
		} );
		this.setState( { activeView: secondaryViewKey } );
	};

	closeSecondaryView = () => {
		this.props.recordTracksEvent( `calypso_inlinehelp_${ this.state.activeSecondaryView }_hide`, {
			location: 'inline-help-popover',
		} );
		this.setState( {
			activeView: VIEW_SEARCH,
			selectedResult: null,
		} );
	};

	openContactView = () => {
		this.openSecondaryView( VIEW_CONTACT );
	};

	renderPopoverFooter() {
		const { translate } = this.props;
		return (
			<div className="inline-help__footer">
				{ this.state.activeView === VIEW_SEARCH ? (
					<>
						<Button
							onClick={ this.moreHelpClicked }
							className="inline-help__more-button"
							borderless
							href="/help"
						>
							<Gridicon icon="help" className="inline-help__gridicon-left" />
							{ translate( 'More help' ) }
						</Button>
						<Button
							onClick={ this.openContactView }
							className="inline-help__contact-button"
							borderless
						>
							<Gridicon icon="chat" className="inline-help__gridicon-left" />
							{ translate( 'Contact us' ) }
							<Gridicon icon="chevron-right" className="inline-help__gridicon-right" />
						</Button>
					</>
				) : (
					<Button
						onClick={ this.closeSecondaryView }
						className="inline-help__cancel-button"
						borderless
					>
						<Gridicon icon="chevron-left" className="inline-help__gridicon-left" />
						{ translate( 'Back' ) }
					</Button>
				) }
			</div>
		);
	}

	renderPopoverContent() {
		return (
			<>
				<div className="inline-help__search">
					<InlineHelpSearchCard
						searchQuery={ this.state.searchQuery }
						onSearch={ this.setSearchQuery }
						isVisible={ ! this.state.activeSecondaryView }
					/>
					<InlineHelpSearchResults
						onSelect={ this.openResultView }
						onAdminSectionSelect={ this.setAdminSection }
						searchQuery={ this.state.searchQuery }
					/>
				</div>
				{ this.renderSecondaryView() }
			</>
		);
	};

	renderView() {
		switch ( this.state.activeView ) {
			case VIEW_SEARCH:
				return (
					<SearchView
						openResultView={ this.openResultView }
						setAdminSection={ this.setAdminSection }
						searchQuery={ this.state.searchQuery }
						onSearch={ this.setSearchQuery }
					/>
				);

			case VIEW_CONTACT:
				return (
					<Suspense fallback={ null }>
						<InlineHelpContactView />
					</Suspense>
				);

			case VIEW_RICH_RESULT:
				return (
					<InlineHelpRichResult
						result={ this.state.selectedResult }
						closePopover={ this.props.onClose }
						showVideoResult={ this.props.showVideoResult }
						searchQuery={ this.state.searchQuery }
					/>
				);
		}
	}

	render() {
		return (
			<div className="inline-help__popover-content">
				{ this.renderView() }
				{ this.renderPopoverFooter() }
			</div>
		);
	}
}

export default withMobileBreakpoint(
	connect( null, { recordTracksEvent } )( localize( InlineHelpPopoverContent ) )
);

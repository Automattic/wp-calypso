/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { flowRight as compose, noop } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import { Gridicon, Button } from '@automattic/components';

/**
 * Internal Dependencies
 */
import {
	VIEW_CONTACT,
	VIEW_RICH_RESULT,
	VIEW_CHECKLIST,
	VIEW_ONBOARDING_WELCOME,
} from './constants';
import {
	selectResult,
	resetInlineHelpContactForm,
	hideOnboardingWelcomePrompt,
	hideChecklistPrompt,
} from 'state/inline-help/actions';
import Popover from 'components/popover';
import ChecklistOnboardingWelcome from 'my-sites/checklist/wpcom-checklist/checklist-onboarding-welcome';
import InlineHelpSearchResults from './inline-help-search-results';
import InlineHelpSearchCard from './inline-help-search-card';
import InlineHelpRichResult from './inline-help-rich-result';
import {
	getSearchQuery,
	getInlineHelpCurrentlySelectedResult,
	isInlineHelpChecklistPromptVisible,
	isOnboardingWelcomePromptVisible,
} from 'state/inline-help/selectors';
import { getHelpSelectedSite } from 'state/help/selectors';
import QuerySupportTypes from 'blocks/inline-help/inline-help-query-support-types';
import InlineHelpContactView from 'blocks/inline-help/inline-help-contact-view';
import WpcomChecklist from 'my-sites/checklist/wpcom-checklist';
import isEligibleForDotcomChecklist from 'state/selectors/is-eligible-for-dotcom-checklist';
import { getSelectedSiteId, getSection } from 'state/ui/selectors';
import getCurrentRoute from 'state/selectors/get-current-route';
import { setSelectedEditor } from 'state/selected-editor/actions';
import {
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
	withAnalytics,
	bumpStat,
} from 'state/analytics/actions';
import getGutenbergEditorUrl from 'state/selectors/get-gutenberg-editor-url';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPostValue } from 'state/posts/selectors';
import QueryActiveTheme from 'components/data/query-active-theme';
import isGutenbergOptInEnabled from 'state/selectors/is-gutenberg-opt-in-enabled';
import isGutenbergOptOutEnabled from 'state/selectors/is-gutenberg-opt-out-enabled';

class InlineHelpPopover extends Component {
	static propTypes = {
		onClose: PropTypes.func.isRequired,
		setDialogState: PropTypes.func.isRequired,
		selectedEditor: PropTypes.string,
		classicUrl: PropTypes.string,
		siteId: PropTypes.number,
		optOut: PropTypes.func,
		optIn: PropTypes.func,
		redirect: PropTypes.func,
		isEligibleForChecklist: PropTypes.bool.isRequired,
		isChecklistPromptVisible: PropTypes.bool,
		isOnboardingWelcomeVisible: PropTypes.bool,
	};

	static defaultProps = {
		onClose: noop,
		isOnboardingWelcomeVisible: false,
	};

	state = {
		showSecondaryView: false,
		activeSecondaryView: '',
	};

	componentDidMount() {
		if ( this.props.isOnboardingWelcomeVisible ) {
			return this.openOnboardingWelcomeView();
		}

		if ( this.props.isChecklistPromptVisible && this.props.isEligibleForChecklist ) {
			return this.openChecklistView();
		}
	}

	componentDidUpdate( prevProps ) {
		if (
			prevProps.isOnboardingWelcomeVisible !== this.props.isOnboardingWelcomeVisible &&
			! this.props.isOnboardingWelcomeVisible
		) {
			this.closeSecondaryView();
		}
	}

	openResultView = event => {
		event.preventDefault();
		this.openSecondaryView( VIEW_RICH_RESULT );
	};

	moreHelpClicked = () => {
		this.props.onClose();
		this.props.recordTracksEvent( 'calypso_inlinehelp_morehelp_click' );
	};

	setSecondaryViewKey = secondaryViewKey => {
		this.setState( { activeSecondaryView: secondaryViewKey } );
	};

	openSecondaryView = secondaryViewKey => {
		this.setSecondaryViewKey( secondaryViewKey );
		this.props.recordTracksEvent( `calypso_inlinehelp_${ secondaryViewKey }_show` );
		this.setState( { showSecondaryView: true } );
	};

	closeSecondaryView = () => {
		this.setSecondaryViewKey( '' );
		this.props.recordTracksEvent( `calypso_inlinehelp_${ this.state.activeSecondaryView }_hide` );
		this.props.selectResult( -1 );
		this.props.resetContactForm();
		// If the welcome message is still active, return to that view
		// otherwise close the secondary view altogether.
		if ( this.props.isOnboardingWelcomeVisible ) {
			return this.openOnboardingWelcomeView();
		}
		this.props.hideChecklistPrompt();
		this.setState( { showSecondaryView: false } );
	};

	openContactView = () => {
		this.openSecondaryView( VIEW_CONTACT );
	};

	openChecklistView = () => {
		this.openSecondaryView( VIEW_CHECKLIST );
	};

	openOnboardingWelcomeView = () => {
		this.openSecondaryView( VIEW_ONBOARDING_WELCOME );
	};

	renderPopoverFooter = () => {
		const { translate } = this.props;
		return (
			<div className="inline-help__footer">
				<Button
					onClick={ this.props.hideOnboardingWelcomePrompt }
					className="inline-help__back-to-help-button"
					borderless
				>
					<Gridicon icon="chevron-left" className="inline-help__gridicon-left" />
					{ translate( 'Help' ) }
				</Button>

				<Button
					onClick={ this.moreHelpClicked }
					className="inline-help__more-button"
					borderless
					href="/help"
				>
					<Gridicon icon="help" className="inline-help__gridicon-left" />
					{ translate( 'More help' ) }
				</Button>

				<Button onClick={ this.openContactView } className="inline-help__contact-button" borderless>
					<Gridicon icon="chat" className="inline-help__gridicon-left" />
					{ translate( 'Contact us' ) }
					<Gridicon icon="chevron-right" className="inline-help__gridicon-right" />
				</Button>

				<Button
					onClick={ this.closeSecondaryView }
					className="inline-help__cancel-button"
					borderless
				>
					<Gridicon icon="chevron-left" className="inline-help__gridicon-left" />
					{ translate( 'Back' ) }
				</Button>
			</div>
		);
	};

	renderPopoverContent = () => {
		return (
			<Fragment>
				<QuerySupportTypes />
				<div className="inline-help__search">
					<InlineHelpSearchCard
						openResult={ this.openResultView }
						query={ this.props.searchQuery }
					/>
					<InlineHelpSearchResults
						openResult={ this.openResultView }
						searchQuery={ this.props.searchQuery }
					/>
				</div>
				{ this.renderSecondaryView() }
				{ ! this.state.showSecondaryView && this.renderPrimaryView() }
			</Fragment>
		);
	};

	renderSecondaryView = () => {
		const { onClose, selectedResult, setDialogState } = this.props;
		const classes = classNames(
			'inline-help__secondary-view',
			`inline-help__${ this.state.activeSecondaryView }`
		);
		return (
			<div className={ classes }>
				{
					{
						[ VIEW_CONTACT ]: <InlineHelpContactView />,
						[ VIEW_RICH_RESULT ]: (
							<InlineHelpRichResult
								result={ selectedResult }
								setDialogState={ setDialogState }
								closePopover={ onClose }
							/>
						),
						[ VIEW_CHECKLIST ]: <WpcomChecklist closePopover={ onClose } viewMode="prompt" />,
						[ VIEW_ONBOARDING_WELCOME ]: <ChecklistOnboardingWelcome onClose={ onClose } />,
					}[ this.state.activeSecondaryView ]
				}
			</div>
		);
	};

	renderPrimaryView = () => {
		const {
			translate,
			showNotification,
			siteId,
			setNotification,
			setStoredTask,
			showOptIn,
			showOptOut,
			onClose,
		} = this.props;

		return (
			<>
				<QueryActiveTheme siteId={ siteId } />
				{ showOptOut && (
					<Button
						onClick={ this.switchToClassicEditor }
						className="inline-help__classic-editor-toggle"
					>
						{ translate( 'Switch to Classic Editor' ) }
					</Button>
				) }

				{ showOptIn && (
					<Button
						onClick={ this.switchToBlockEditor }
						className="inline-help__gutenberg-editor-toggle"
					>
						{ translate( 'Switch to Block Editor' ) }
					</Button>
				) }

				<WpcomChecklist
					viewMode="navigation"
					closePopover={ onClose }
					showNotification={ showNotification }
					setNotification={ setNotification }
					setStoredTask={ setStoredTask }
				/>
			</>
		);
	};

	switchToClassicEditor = () => {
		const { siteId, onClose, optOut, classicUrl, translate } = this.props;
		const proceed =
			typeof window === 'undefined' ||
			window.confirm( translate( 'Are you sure you wish to leave this page?' ) );
		if ( proceed ) {
			optOut( siteId, classicUrl );
			onClose();
		}
	};

	switchToBlockEditor = () => {
		const { siteId, onClose, optIn, gutenbergUrl } = this.props;
		optIn( siteId, gutenbergUrl );
		onClose();
	};

	render() {
		const popoverClasses = {
			'is-secondary-view-active': this.state.showSecondaryView,
			'is-onboarding-welcome-active': VIEW_ONBOARDING_WELCOME === this.state.activeSecondaryView,
		};

		return (
			<Popover
				isVisible
				onClose={ this.props.onClose }
				position="top left"
				context={ this.props.context }
				className={ classNames( 'inline-help__popover', popoverClasses ) }
			>
				{ this.renderPopoverContent() }
				{ this.renderPopoverFooter() }
			</Popover>
		);
	}
}

const optOut = ( siteId, classicUrl ) => {
	return withAnalytics(
		composeAnalytics(
			recordGoogleEvent(
				'Gutenberg Opt-Out',
				'Clicked "Switch to the classic editor" in the help popover.',
				'Opt-In',
				false
			),
			recordTracksEvent( 'calypso_gutenberg_opt_in', {
				opt_in: false,
			} ),
			bumpStat( 'gutenberg-opt-in', 'Calypso Help Opt Out' )
		),
		setSelectedEditor( siteId, 'classic', classicUrl )
	);
};

const optIn = ( siteId, gutenbergUrl ) => {
	return withAnalytics(
		composeAnalytics(
			recordGoogleEvent(
				'Gutenberg Opt-In',
				'Clicked "Switch to Block editor" in inline help.',
				'Opt-In',
				true
			),
			recordTracksEvent( 'calypso_gutenberg_opt_in', {
				opt_in: true,
			} ),
			bumpStat( 'gutenberg-opt-in', 'Calypso Help Opt In' )
		),
		setSelectedEditor( siteId, 'gutenberg', gutenbergUrl )
	);
};

function mapStateToProps( state ) {
	const siteId = getSelectedSiteId( state );
	const currentRoute = getCurrentRoute( state );
	const classicRoute = currentRoute.replace( '/block-editor/', '' );
	const section = getSection( state );
	const isCalypsoClassic = section.group && section.group === 'editor';
	const optInEnabled = isGutenbergOptInEnabled( state, siteId );
	const postId = getEditorPostId( state );
	const postType = getEditedPostValue( state, siteId, postId, 'type' );
	const gutenbergUrl = getGutenbergEditorUrl( state, siteId, postId, postType );
	const isEligibleForChecklist = isEligibleForDotcomChecklist( state, siteId );

	return {
		isOnboardingWelcomeVisible: isEligibleForChecklist && isOnboardingWelcomePromptVisible( state ),
		isChecklistPromptVisible: isInlineHelpChecklistPromptVisible( state ),
		searchQuery: getSearchQuery( state ),
		isEligibleForChecklist: isEligibleForDotcomChecklist( state, siteId ),
		selectedSite: getHelpSelectedSite( state ),
		selectedResult: getInlineHelpCurrentlySelectedResult( state ),
		classicUrl: `/${ classicRoute }`,
		siteId,
		showOptOut: isGutenbergOptOutEnabled( state, siteId ),
		showOptIn: optInEnabled && isCalypsoClassic,
		gutenbergUrl,
	};
}

const mapDispatchToProps = {
	hideOnboardingWelcomePrompt,
	hideChecklistPrompt,
	optOut,
	optIn,
	recordTracksEvent,
	selectResult,
	resetContactForm: resetInlineHelpContactForm,
};

export default compose(
	localize,
	connect( mapStateToProps, mapDispatchToProps )
)( InlineHelpPopover );

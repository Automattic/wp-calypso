/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { flowRight as compose, noop } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import Gridicon from 'components/gridicon';

/**
 * Internal Dependencies
 */
import { VIEW_CONTACT, VIEW_RICH_RESULT } from './constants';
import { selectResult, resetInlineHelpContactForm } from 'state/inline-help/actions';
import { Button } from '@automattic/components';
import Popover from 'components/popover';
import InlineHelpSearchResults from './inline-help-search-results';
import InlineHelpSearchCard from './inline-help-search-card';
import InlineHelpRichResult from './inline-help-rich-result';
import { getSearchQuery, getInlineHelpCurrentlySelectedResult } from 'state/inline-help/selectors';
import { getHelpSelectedSite } from 'state/help/selectors';
import QuerySupportTypes from 'blocks/inline-help/inline-help-query-support-types';
import InlineHelpContactView from 'blocks/inline-help/inline-help-contact-view';
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
	};

	static defaultProps = {
		onClose: noop,
	};

	state = {
		showSecondaryView: false,
		activeSecondaryView: '',
	};

	openResultView = ( event ) => {
		event.preventDefault();
		this.openSecondaryView( VIEW_RICH_RESULT );
	};

	moreHelpClicked = () => {
		this.props.onClose();
		this.props.recordTracksEvent( 'calypso_inlinehelp_morehelp_click' );
	};

	setSecondaryViewKey = ( secondaryViewKey ) => {
		this.setState( { activeSecondaryView: secondaryViewKey } );
	};

	openSecondaryView = ( secondaryViewKey ) => {
		this.setSecondaryViewKey( secondaryViewKey );
		this.props.recordTracksEvent( `calypso_inlinehelp_${ secondaryViewKey }_show` );
		this.setState( { showSecondaryView: true } );
	};

	closeSecondaryView = () => {
		this.setSecondaryViewKey( '' );
		this.props.recordTracksEvent( `calypso_inlinehelp_${ this.state.activeSecondaryView }_hide` );
		this.props.selectResult( -1 );
		this.props.resetContactForm();
		this.setState( { showSecondaryView: false } );
	};

	openContactView = () => {
		this.openSecondaryView( VIEW_CONTACT );
	};

	renderPopoverFooter = () => {
		const { translate } = this.props;
		return (
			<div className="inline-help__footer">
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
					}[ this.state.activeSecondaryView ]
				}
			</div>
		);
	};

	renderPrimaryView = () => {
		const { translate, siteId, showOptIn, showOptOut, isCheckout } = this.props;

		// Don't show additional items inside Checkout.
		if ( isCheckout ) {
			return null;
		}

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
	const showSwitchEditorButton = currentRoute.match( /^\/(block-editor|post|page)\// );

	return {
		searchQuery: getSearchQuery( state ),
		isEligibleForChecklist: isEligibleForDotcomChecklist( state, siteId ),
		selectedSite: getHelpSelectedSite( state ),
		selectedResult: getInlineHelpCurrentlySelectedResult( state ),
		classicUrl: `/${ classicRoute }`,
		siteId,
		showOptOut: showSwitchEditorButton && isGutenbergOptOutEnabled( state, siteId ),
		showOptIn: showSwitchEditorButton && optInEnabled && isCalypsoClassic,
		gutenbergUrl,
		isCheckout: section.name && section.name === 'checkout',
	};
}

const mapDispatchToProps = {
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

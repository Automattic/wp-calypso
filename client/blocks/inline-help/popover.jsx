/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { noop } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal Dependencies
 */
import { VIEW_CONTACT, VIEW_RICH_RESULT } from './constants';
import { selectResult, resetInlineHelpContactForm } from 'state/inline-help/actions';
import Button from 'components/button';
import Popover from 'components/popover';
import InlineHelpSearchResults from './inline-help-search-results';
import InlineHelpSearchCard from './inline-help-search-card';
import InlineHelpRichResult from './inline-help-rich-result';
import { getSearchQuery, getInlineHelpCurrentlySelectedResult } from 'state/inline-help/selectors';
import { getHelpSelectedSite } from 'state/help/selectors';
import QuerySupportTypes from 'blocks/inline-help/inline-help-query-support-types';
import InlineHelpContactView from 'blocks/inline-help/inline-help-contact-view';
import WpcomChecklist from 'my-sites/checklist/wpcom-checklist';
import { getSelectedSiteId, getSection } from 'state/ui/selectors';
import { getSelectedEditor } from 'state/selectors/get-selected-editor';
import getCurrentRoute from 'state/selectors/get-current-route';
import { setSelectedEditor } from 'state/selected-editor/actions';
import {
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
	withAnalytics,
	bumpStat,
} from 'state/analytics/actions';
import { isEnabled } from 'config';
import getGutenbergEditorUrl from 'state/selectors/get-gutenberg-editor-url';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPostValue } from 'state/posts/selectors';
import isGutenbergEnabled from '../../state/selectors/is-gutenberg-enabled';
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

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
	};

	static defaultProps = {
		onClose: noop,
	};

	state = {
		showSecondaryView: false,
		activeSecondaryView: '',
	};

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
		this.setState( { showSecondaryView: false } );
	};

	openContactView = () => {
		this.openSecondaryView( VIEW_CONTACT );
	};

	renderSecondaryView = () => {
		const classes = classNames(
			'inline-help__secondary-view',
			`inline-help__${ this.state.activeSecondaryView }`
		);
		return (
			<div className={ classes }>
				{
					{
						contact: <InlineHelpContactView />,
						richresult: (
							<InlineHelpRichResult
								result={ this.props.selectedResult }
								setDialogState={ this.props.setDialogState }
								closePopover={ this.props.onClose }
							/>
						),
					}[ this.state.activeSecondaryView ]
				}
			</div>
		);
	};

	switchToClassicEditor = () => {
		const { siteId, onClose, optOut, classicUrl } = this.props;
		const proceed =
			typeof window === 'undefined' ||
			window.confirm( __( 'Are you sure you wish to leave this page?' ) );
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
		const {
			translate,
			showNotification,
			setNotification,
			setStoredTask,
			showOptIn,
			showOptOut,
		} = this.props;
		const { showSecondaryView } = this.state;
		const popoverClasses = { 'is-secondary-view-active': showSecondaryView };

		return (
			<Popover
				isVisible
				onClose={ this.props.onClose }
				position="top left"
				context={ this.props.context }
				className={ classNames( 'inline-help__popover', popoverClasses ) }
			>
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

				{ ! showSecondaryView &&
					showOptOut && (
						<Button
							onClick={ this.switchToClassicEditor }
							className="inline-help__classic-editor-toggle"
						>
							{ translate( 'Switch to Classic Editor' ) }
						</Button>
					) }

				{ ! showSecondaryView &&
					showOptIn && (
						<Button
							onClick={ this.switchToBlockEditor }
							className="inline-help__gutenberg-editor-toggle"
						>
							{ translate( 'Switch to Block Editor' ) }
						</Button>
					) }

				{ ! showSecondaryView && (
					<WpcomChecklist
						viewMode="navigation"
						closePopover={ this.props.onClose }
						showNotification={ showNotification }
						setNotification={ setNotification }
						setStoredTask={ setStoredTask }
					/>
				) }

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

					<Button
						onClick={ this.openContactView }
						className="inline-help__contact-button"
						borderless
					>
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
	const isGutenbergEditor = section.group && section.group === 'gutenberg';
	const optInEnabled =
		isEnabled( 'gutenberg/opt-in' ) && isGutenbergEnabled( state, getSelectedSiteId( state ) );

	const postId = getEditorPostId( state );
	const postType = getEditedPostValue( state, siteId, postId, 'type' );

	const gutenbergUrl = getGutenbergEditorUrl( state, siteId, postId, postType );

	return {
		searchQuery: getSearchQuery( state ),
		selectedSite: getHelpSelectedSite( state ),
		selectedResult: getInlineHelpCurrentlySelectedResult( state ),
		selectedEditor: getSelectedEditor( state, siteId ),
		classicUrl: `/${ classicRoute }`,
		siteId,
		showOptOut: optInEnabled && isGutenbergEditor,
		showOptIn: optInEnabled && isCalypsoClassic,
		gutenbergUrl,
	};
}

const mapDispatchToProps = {
	optOut,
	optIn,
	recordTracksEvent,
	selectResult,
	resetContactForm: resetInlineHelpContactForm,
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( InlineHelpPopover ) );

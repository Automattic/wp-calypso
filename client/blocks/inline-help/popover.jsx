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
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSelectedEditor } from 'state/selectors/get-selected-editor';
import getCurrentRoute from 'state/selectors/get-current-route';
import { setSelectedEditor } from 'state/selected-editor/actions';
import { navigate } from 'state/ui/actions';
import {
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
	withAnalytics,
	bumpStat,
} from 'state/analytics/actions';

class InlineHelpPopover extends Component {
	static propTypes = {
		onClose: PropTypes.func.isRequired,
		setDialogState: PropTypes.func.isRequired,
		selectedEditor: PropTypes.string,
		classicUrl: PropTypes.string,
		siteId: PropTypes.number,
		optOut: PropTypes.func,
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
		const { siteId, optOut, classicUrl, redirect } = this.props;
		optOut( siteId );
		redirect( classicUrl );
	};

	render() {
		const { translate, showNotification, setNotification, setStoredTask } = this.props;
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

				<WpcomChecklist
					viewMode="navigation"
					closePopover={ this.props.onClose }
					showNotification={ showNotification }
					setNotification={ setNotification }
					setStoredTask={ setStoredTask }
				/>

				{ 'gutenberg' === this.props.selectedEditor && (
					<Button
						onClick={ this.switchToClassicEditor }
						className="inline-help__classic-editor-toggle"
					>
						{ translate( 'Switch to the Classic Editor' ) }
					</Button>
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

function mapStateToProps( state ) {
	const siteId = getSelectedSiteId( state );
	const currentRoute = getCurrentRoute( state );
	const classicRoute = currentRoute.replace( '/gutenberg/', '' );

	return {
		searchQuery: getSearchQuery( state ),
		selectedSite: getHelpSelectedSite( state ),
		selectedResult: getInlineHelpCurrentlySelectedResult( state ),
		selectedEditor: getSelectedEditor( state, siteId ),
		classicUrl: `/${ classicRoute }`,
		siteId,
	};
}

function mapDispatchToProps( dispatch ) {
	return {
		optOut: siteId => {
			dispatch(
				withAnalytics(
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
					setSelectedEditor( siteId, 'classic' )
				)
			);
		},
		recordTracksEvent,
		selectResult,
		resetContactForm: resetInlineHelpContactForm,
		redirect: classicUrl => {
			dispatch( navigate( classicUrl ) );
		},
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( InlineHelpPopover ) );

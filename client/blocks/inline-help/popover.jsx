/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { noop, get, reduce } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal Dependencies
 */
import { VIEW_CONTACT, VIEW_RICH_RESULT } from './constants';
import { recordTracksEvent } from 'state/analytics/actions';
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
import ProgressBar from 'components/progress-bar';
import getSiteChecklist from 'state/selectors/get-site-checklist';
import { tasks } from 'my-sites/checklist/onboardingChecklist';
import { getSelectedSiteId, getSectionName } from 'state/ui/selectors';
import { getSite } from 'state/sites/selectors';
import { getChecklistStatus, setChecklistStatus } from 'state/checklist/actions';

class InlineHelpPopover extends Component {
	static propTypes = {
		onClose: PropTypes.func.isRequired,
		setDialogState: PropTypes.func.isRequired,
		sectionName: PropTypes.string,
		showChecklistNotification: PropTypes.bool,
		setChecklistStatus: PropTypes.func,
	};

	static defaultProps = {
		onClose: noop,
	};

	state = {
		showSecondaryView: false,
		shouldShowChecklist: false,
		activeSecondaryView: '',
	};

	componentDidMount() {
		this.shouldShowChecklist();
	}

	openResultView = event => {
		event.preventDefault();
		this.openSecondaryView( VIEW_RICH_RESULT );
	};

	moreHelpClicked = () => {
		this.props.onClose();
		this.props.recordTracksEvent( 'calypso_inlinehelp_morehelp_click' );
	};

	checklistClicked = () => {
		this.props.setChecklistStatus( false );
		this.props.onClose();
		this.props.recordTracksEvent( 'calypso_inlinehelp_checklist_click' );
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

	shouldShowChecklist = () => {
		const { sectionName } = this.props;
		const totalTasks = tasks.length;
		const isAtomicSite = get( this.props, 'selectedSite.options.is_automated_transfer' );
		const isJetpackSite = get( this.props, 'selectedSite.jetpack' );
		const disallowedSections = [
			'discover',
			'reader',
			'reader-activities',
			'reader-list',
			'reader-recommendations',
			'reader-tags',
			'checklist',
		];

		if (
			totalTasks &&
			! isAtomicSite &&
			! isJetpackSite &&
			! ( disallowedSections.indexOf( sectionName ) > -1 )
		) {
			this.setState( { shouldShowChecklist: true } );
		}
	};

	renderChecklistProgress = () => {
		const { taskStatuses, siteSuffix, translate, showChecklistNotification } = this.props;
		const { shouldShowChecklist } = this.state;
		const inlineHelpButtonClasses = {
			'checklist-count-notification': showChecklistNotification,
			'inline-help__checklist-count': true,
		};
		const totalTasks = tasks.length;
		const numComplete = reduce(
			tasks,
			( count, { id, completed: taskComplete } ) =>
				taskComplete || get( taskStatuses, [ id, 'completed' ] ) ? count + 1 : count,
			0
		);

		if ( ! shouldShowChecklist ) {
			return false;
		}

		if ( numComplete === totalTasks ) {
			// @TODO show something else?
			return false;
		}

		const checklistLink = '/checklist' + siteSuffix;

		return (
			<div className="inline-help__checklist">
				<Button
					onClick={ this.checklistClicked }
					href={ checklistLink }
					className="inline-help__checklist-button"
					borderless
				>
					<span className="inline-help__checklist-label">
						{ translate( 'Continue Site Setup' ) }
					</span>

					<span className={ classNames( inlineHelpButtonClasses ) }>
						{ numComplete }/{ totalTasks }
					</span>

					<div className="inline-help__progress-bar-margin">
						<ProgressBar color="#4ab866" total={ totalTasks } value={ numComplete } compact />
					</div>
				</Button>
			</div>
		);
	};

	render() {
		const { translate } = this.props;
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
				{ this.renderChecklistProgress() }

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
	const site = getSite( state, siteId );

	return {
		searchQuery: getSearchQuery( state ),
		selectedSite: getHelpSelectedSite( state ),
		siteId,
		site,
		siteSuffix: site ? '/' + site.slug : '',
		selectedResult: getInlineHelpCurrentlySelectedResult( state ),
		taskStatuses: get( getSiteChecklist( state, siteId ), [ 'tasks' ] ),
		sectionName: getSectionName( state ),
		showChecklistNotification: getChecklistStatus( state ),
	};
}

export default connect(
	mapStateToProps,
	{
		recordTracksEvent,
		selectResult,
		resetContactForm: resetInlineHelpContactForm,
		setChecklistStatus,
	}
)( localize( InlineHelpPopover ) );

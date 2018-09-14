/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { identity, get, reduce, find } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import debugFactory from 'debug';
import Gridicon from 'gridicons';

/**
 * Internal Dependencies
 */
import config from 'config';
import { recordTracksEvent } from 'state/analytics/actions';
import getGlobalKeyboardShortcuts from 'lib/keyboard-shortcuts/global';
import Button from 'components/button';
import HappychatButton from 'components/happychat/button';
import Dialog from 'components/dialog';
import ResizableIframe from 'components/resizable-iframe';
import isHappychatOpen from 'state/happychat/selectors/is-happychat-open';
import hasActiveHappychatSession from 'state/happychat/selectors/has-active-happychat-session';
import AsyncLoad from 'components/async-load';
import { getSelectedSite, getSelectedSiteId, getSectionName } from 'state/ui/selectors';
import getSiteChecklist from 'state/selectors/get-site-checklist';
import QuerySiteChecklist from 'components/data/query-site-checklist';
import { getTasks } from 'my-sites/checklist/onboardingChecklist';
import isEligibleForDotcomChecklist from 'state/selectors/is-eligible-for-dotcom-checklist';

/**
 * Module variables
 */
const globalKeyBoardShortcutsEnabled = config.isEnabled( 'keyboard-shortcuts' );
const globalKeyboardShortcuts = globalKeyBoardShortcutsEnabled
	? getGlobalKeyboardShortcuts()
	: null;
const debug = debugFactory( 'calypso:inline-help' );

const InlineHelpPopover = props => (
	<AsyncLoad { ...props } require="blocks/inline-help/popover" placeholder={ null } />
);

class InlineHelp extends Component {
	static propTypes = {
		translate: PropTypes.func,
		sectionName: PropTypes.string,
		siteId: PropTypes.number,
		isEligibleForDotcomChecklist: PropTypes.bool,
	};

	static defaultProps = {
		translate: identity,
	};

	state = {
		showInlineHelp: false,
		shouldShowChecklist: false,
		nextChecklistTask: null,
	};

	componentDidMount() {
		if ( globalKeyboardShortcuts ) {
			globalKeyboardShortcuts.showInlineHelp = this.showInlineHelp;
		}

		this.shouldShowChecklistNotification();
	}

	componentWillUnmount() {
		if ( globalKeyboardShortcuts ) {
			globalKeyboardShortcuts.showInlineHelp = null;
		}
	}

	componentWillReceiveProps( nextProps ) {
		if ( ! this.props.isHappychatOpen && nextProps.isHappychatOpen ) {
			this.closeInlineHelp();
		}

		this.shouldShowChecklistNotification();
	}

	preloaded = false;

	// Preload the async chunk on mouse hover or touch start
	preload = () => {
		if ( ! this.preloaded ) {
			asyncRequire( 'blocks/inline-help/popover' );
			this.preloaded = true;
		}
	};

	toggleInlineHelp = () => {
		const { showInlineHelp } = this.state;

		if ( showInlineHelp ) {
			this.closeInlineHelp();
		} else {
			this.showInlineHelp();
		}
	};

	getTask = () => {
		const task = find(
			this.props.tasks,
			( { id, completed } ) => ! completed && ! get( this.props.taskStatuses, [ id, 'completed' ] )
		);
		return task;
	};

	shouldShowChecklist = () => {
		const { sectionName } = this.props;
		const disallowedSections = [
			'discover',
			'reader',
			'reader-activities',
			'reader-list',
			'reader-recommendations',
			'reader-tags',
			'checklist',
			'signup',
		];

		if ( isEligibleForDotcomChecklist && ! ( disallowedSections.indexOf( sectionName ) > -1 ) ) {
			return true;
		}
	};

	nextChecklistTask = task => {
		const { nextChecklistTask } = this.state;

		if ( task !== nextChecklistTask ) {
			this.setState( { nextChecklistTask: task } );
		}
	};

	shouldShowChecklistNotification = () => {
		const { taskStatuses, tasks } = this.props;
		const { nextChecklistTask } = this.state;
		const task = this.getTask();
		const totalTasks = tasks.length;
		const numComplete = reduce(
			tasks,
			( count, { id, completed: taskComplete } ) =>
				taskComplete || get( taskStatuses, [ id, 'completed' ] ) ? count + 1 : count,
			0
		);

		if (
			totalTasks &&
			numComplete !== totalTasks &&
			task &&
			( null === nextChecklistTask || task.id !== nextChecklistTask )
		) {
			return true;
		} else {
			return false;
		}
	};

	showInlineHelp = () => {
		debug( 'showing inline help.' );
		this.props.recordTracksEvent( 'calypso_inlinehelp_show' );
		this.setState( { showInlineHelp: true } );
	};

	closeInlineHelp = () => {
		debug( 'hiding inline help.' );
		this.props.recordTracksEvent( 'calypso_inlinehelp_close' );
		this.setState( { showInlineHelp: false } );
	};

	handleHelpButtonClicked = () => {
		this.toggleInlineHelp();
	};

	inlineHelpToggleRef = node => {
		this.inlineHelpToggle = node;
	};

	// @TODO: Instead of prop drilling this should be done via redux
	setDialogState = ( { showDialog, videoLink = null, dialogType } ) =>
		this.setState( {
			showDialog,
			videoLink,
			dialogType,
		} );

	closeDialog = () => this.setState( { showDialog: false } );

	getDialogButtons() {
		const { translate } = this.props;
		const { dialogType } = this.state;

		if ( dialogType === 'video' ) {
			return [
				<Button onClick={ this.closeDialog }>{ translate( 'Close', { textOnly: true } ) }</Button>,
			];
		}

		return [];
	}

	render() {
		const { translate, siteId } = this.props;
		const { showInlineHelp, showDialog, videoLink, dialogType } = this.state;
		const inlineHelpButtonClasses = {
			'inline-help__button': true,
			'is-active': showInlineHelp,
			'has-notification': this.shouldShowChecklist() && this.shouldShowChecklistNotification(),
		};

		/* @TODO: This class is not valid and this tricks the linter
		 		  fix this class and fix the linter to catch similar instances.
		 */
		const iframeClasses = classNames( 'inline-help__richresult__dialog__video' );
		const dialogClasses = classNames( 'inline-help__richresult__dialog', dialogType );
		const dialogButtons = this.getDialogButtons();

		return (
			<div className="inline-help">
				{ siteId && <QuerySiteChecklist siteId={ siteId } /> }
				<Button
					className={ classNames( inlineHelpButtonClasses ) }
					onClick={ this.handleHelpButtonClicked }
					onTouchStart={ this.preload }
					onMouseEnter={ this.preload }
					borderless
					title={ translate( 'Help' ) }
					ref={ this.inlineHelpToggleRef }
				>
					<Gridicon icon="help-outline" size={ 36 } />
				</Button>
				{ showInlineHelp && (
					<InlineHelpPopover
						context={ this.inlineHelpToggle }
						onClose={ this.closeInlineHelp }
						setDialogState={ this.setDialogState }
						showChecklist={ this.shouldShowChecklist() }
						showChecklistNotification={ this.shouldShowChecklistNotification() }
						nextChecklistTask={ this.nextChecklistTask }
					/>
				) }
				{ showDialog && (
					<Dialog
						additionalClassNames={ dialogClasses }
						isVisible
						buttons={ dialogButtons }
						onCancel={ this.closeDialog }
						onClose={ this.closeDialog }
					>
						{ dialogType === 'video' && (
							<div className={ iframeClasses }>
								<ResizableIframe
									src={ videoLink + '?rel=0&amp;showinfo=0&amp;autoplay=1' }
									frameBorder="0"
									seamless
									allowFullScreen
									autoPlay
									width="640"
									height="360"
								/>
							</div>
						) }
					</Dialog>
				) }
				{ this.props.isHappychatButtonVisible &&
					config.isEnabled( 'happychat' ) && (
						<HappychatButton className="inline-help__happychat-button" allowMobileRedirect />
					) }
			</div>
		);
	}
}

const mapStateToProps = state => {
	const siteId = getSelectedSiteId( state );

	return {
		tasks: getTasks( state, siteId ),
		siteId,
		isHappychatButtonVisible: hasActiveHappychatSession( state ),
		isHappychatOpen: isHappychatOpen( state ),
		taskStatuses: get( getSiteChecklist( state, siteId ), [ 'tasks' ] ),
		selectedSite: getSelectedSite( state ),
		sectionName: getSectionName( state ),
		isEligibleForDotcomChecklist: isEligibleForDotcomChecklist( state, siteId ),
	};
};

const mapDispatchToProps = {
	recordTracksEvent,
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( InlineHelp ) );

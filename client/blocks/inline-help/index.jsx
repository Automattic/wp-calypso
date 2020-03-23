/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { identity } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import debugFactory from 'debug';
import Gridicon from 'components/gridicon';

/**
 * Internal Dependencies
 */
import config from 'config';
import { recordTracksEvent } from 'state/analytics/actions';
import getGlobalKeyboardShortcuts from 'lib/keyboard-shortcuts/global';
import { Button } from '@automattic/components';
import HappychatButton from 'components/happychat/button';
import isHappychatOpen from 'state/happychat/selectors/is-happychat-open';
import hasActiveHappychatSession from 'state/happychat/selectors/has-active-happychat-session';
import AsyncLoad from 'components/async-load';
import WpcomChecklist from 'my-sites/checklist/wpcom-checklist';
import {
	showInlineHelpPopover,
	hideInlineHelpPopover,
	hideChecklistPrompt,
} from 'state/inline-help/actions';
import {
	isInlineHelpPopoverVisible,
	getChecklistPromptTaskId,
	isInlineHelpChecklistPromptVisible,
} from 'state/inline-help/selectors';

/**
 * Style dependencies
 */
import './style.scss';

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

const InlineHelpDialog = props => (
	<AsyncLoad { ...props } require="blocks/inline-help/dialog" placeholder={ null } />
);

class InlineHelp extends Component {
	static propTypes = {
		translate: PropTypes.func,
		isPopoverVisible: PropTypes.bool.isRequired,
	};

	static defaultProps = {
		translate: identity,
		isPopoverVisible: false,
	};

	state = {
		showChecklistNotification: false,
		storedTask: null,
	};

	componentDidMount() {
		if ( globalKeyboardShortcuts ) {
			globalKeyboardShortcuts.showInlineHelp = this.showInlineHelp;
		}

		if ( this.props.isChecklistPromptVisible && this.props.checklistPromptTaskId ) {
			this.props.showInlineHelpPopover();
		}
	}

	componentWillUnmount() {
		if ( globalKeyboardShortcuts ) {
			globalKeyboardShortcuts.showInlineHelp = null;
		}
	}

	componentDidUpdate( prevProps ) {
		if ( ! prevProps.isHappychatOpen && this.props.isHappychatOpen ) {
			this.closeInlineHelp();
		}
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
		if ( this.props.isPopoverVisible ) {
			this.closeInlineHelp();
		} else {
			this.showInlineHelp();
		}
	};

	showInlineHelp = () => {
		debug( 'showing inline help.' );
		this.props.recordTracksEvent( 'calypso_inlinehelp_show' );
		this.props.showInlineHelpPopover();
	};

	closeInlineHelp = () => {
		debug( 'hiding inline help.' );
		this.props.recordTracksEvent( 'calypso_inlinehelp_close' );
		this.props.hideInlineHelpPopover();
		this.props.hideChecklistPrompt();
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

	setNotification = status => {
		this.setState( { showChecklistNotification: status } );
	};

	setStoredTask = taskKey => {
		this.setState( { storedTask: taskKey } );
	};

	render() {
		const { translate, isPopoverVisible } = this.props;
		const { showDialog, videoLink, dialogType, showChecklistNotification, storedTask } = this.state;
		const inlineHelpButtonClasses = {
			'inline-help__button': true,
			'is-active': isPopoverVisible,
			'has-notification': showChecklistNotification,
		};

		return (
			<div className="inline-help">
				<WpcomChecklist
					viewMode="notification"
					setNotification={ this.setNotification }
					storedTask={ storedTask }
				/>
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
				{ isPopoverVisible && (
					<InlineHelpPopover
						context={ this.inlineHelpToggle }
						onClose={ this.closeInlineHelp }
						setDialogState={ this.setDialogState }
						setNotification={ this.setNotification }
						setStoredTask={ this.setStoredTask }
						showNotification={ showChecklistNotification }
					/>
				) }
				{ showDialog && (
					<InlineHelpDialog
						dialogType={ dialogType }
						videoLink={ videoLink }
						onClose={ this.closeDialog }
					/>
				) }
				{ this.props.isHappychatButtonVisible && config.isEnabled( 'happychat' ) && (
					<HappychatButton className="inline-help__happychat-button" allowMobileRedirect />
				) }
			</div>
		);
	}
}

const mapStateToProps = state => {
	return {
		isHappychatButtonVisible: hasActiveHappychatSession( state ),
		isHappychatOpen: isHappychatOpen( state ),
		isPopoverVisible: isInlineHelpPopoverVisible( state ),
		isChecklistPromptVisible: isInlineHelpChecklistPromptVisible( state ),
		checklistPromptTaskId: getChecklistPromptTaskId( state ),
	};
};

const mapDispatchToProps = {
	recordTracksEvent,
	showInlineHelpPopover,
	hideInlineHelpPopover,
	hideChecklistPrompt,
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( InlineHelp ) );

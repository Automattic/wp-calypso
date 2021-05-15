/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import debugFactory from 'debug';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal Dependencies
 */
import config from '@automattic/calypso-config';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getGlobalKeyboardShortcuts from 'calypso/lib/keyboard-shortcuts/global';
import { Button, RootChild } from '@automattic/components';
import { isWithinBreakpoint } from '@automattic/viewport';
import isHappychatOpen from 'calypso/state/happychat/selectors/is-happychat-open';
import AsyncLoad from 'calypso/components/async-load';
import { showInlineHelpPopover, hideInlineHelpPopover } from 'calypso/state/inline-help/actions';
import isInlineHelpPopoverVisible from 'calypso/state/inline-help/selectors/is-inline-help-popover-visible';

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

const InlineHelpPopover = ( props ) => (
	<AsyncLoad { ...props } require="calypso/blocks/inline-help/popover" placeholder={ null } />
);

const InlineHelpDialog = ( props ) => (
	<AsyncLoad { ...props } require="calypso/blocks/inline-help/dialog" placeholder={ null } />
);

class InlineHelp extends Component {
	static propTypes = {
		translate: PropTypes.func,
		isPopoverVisible: PropTypes.bool.isRequired,
	};

	static defaultProps = {
		isPopoverVisible: false,
	};

	state = {};

	componentDidMount() {
		if ( globalKeyboardShortcuts ) {
			globalKeyboardShortcuts.showInlineHelp = this.showInlineHelp;
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
			asyncRequire( 'calypso/blocks/inline-help/popover' );
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
		this.props.recordTracksEvent( 'calypso_inlinehelp_show', { location: 'inline-help-popover' } );
		this.props.showInlineHelpPopover();
	};

	closeInlineHelp = () => {
		debug( 'hiding inline help.' );
		this.props.recordTracksEvent( 'calypso_inlinehelp_close', { location: 'inline-help-popover' } );
		this.props.hideInlineHelpPopover();
	};

	handleHelpButtonClicked = () => {
		this.toggleInlineHelp();
	};

	inlineHelpToggleRef = ( node ) => {
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

	render() {
		const { translate, isPopoverVisible } = this.props;
		const { showDialog, videoLink, dialogType } = this.state;
		const inlineHelpButtonClasses = {
			'inline-help__button': true,
			'is-active': isPopoverVisible,
			'is-compact': true,
		};

		return (
			<div className="inline-help">
				<Button
					className={ classNames( inlineHelpButtonClasses ) }
					onClick={ this.handleHelpButtonClicked }
					onTouchStart={ this.preload }
					onMouseEnter={ this.preload }
					borderless
					title={ translate( 'Help' ) }
					ref={ this.inlineHelpToggleRef }
				>
					<Gridicon icon={ ! isPopoverVisible ? 'help' : 'cross-circle' } size={ 48 } />
				</Button>
				{ isPopoverVisible && (
					<InlineHelpPopover
						context={ this.inlineHelpToggle }
						onClose={ this.closeInlineHelp }
						setDialogState={ this.setDialogState }
					/>
				) }
				{ isWithinBreakpoint( '<660px' ) && isPopoverVisible && (
					<RootChild>
						<div className="inline-help__mobile-overlay"></div>
					</RootChild>
				) }
				{ showDialog && (
					<InlineHelpDialog
						dialogType={ dialogType }
						videoLink={ videoLink }
						onClose={ this.closeDialog }
					/>
				) }
			</div>
		);
	}
}

const mapStateToProps = ( state ) => {
	return {
		isHappychatOpen: isHappychatOpen( state ),
		isPopoverVisible: isInlineHelpPopoverVisible( state ),
	};
};

const mapDispatchToProps = {
	recordTracksEvent,
	showInlineHelpPopover,
	hideInlineHelpPopover,
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( InlineHelp ) );

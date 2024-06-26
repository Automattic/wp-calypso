import { Popover } from '@automattic/components';
import { isWithinBreakpoint, MOBILE_BREAKPOINT } from '@automattic/viewport';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useRef } from 'react';
import { connect } from 'react-redux';
import actions from '../state/actions';
import getIsPanelOpen from '../state/selectors/get-is-panel-open';
import getIsShortcutsPopoverOpen from '../state/selectors/get-is-shortcuts-popover-open';
import { HotkeyContainer } from './container-hotkey';
import Gridicon from './gridicons';

export const ShortcutsPopover = ( {
	closeShortcutsPopover,
	toggleShortcutsPopover,
	isPanelOpen,
	isShortcutsPopoverOpen,
	isMobile,
} ) => {
	const translate = useTranslate();

	// create context for the keyboard shortcuts popover icon
	const iconRef = useRef();
	const spanRef = useRef();

	// This function renders a list of keyboard shortcuts
	const renderShortcutsPopover = () => {
		return (
			<Popover
				onClose={ closeShortcutsPopover }
				isVisible={ isPanelOpen && isShortcutsPopoverOpen }
				context={ iconRef.current }
				ignoreContext={ spanRef.current }
				position="bottom left"
				className="wpnc__keyboard-shortcuts-popover"
			>
				<h2>{ translate( 'Keyboard Shortcuts' ) }</h2>
				<ul>
					<li>
						<span className="description">{ translate( 'Toggle Panel' ) }</span>
						<span className="shortcut letter">n</span>
					</li>
					<li>
						<span className="description">{ translate( 'Next' ) }</span>
						<span className="shortcut has-icon">
							<Gridicon icon="arrow-down" size={ 16 } />
						</span>
					</li>
					<li>
						<span className="description">{ translate( 'Previous' ) }</span>
						<span className="shortcut has-icon">
							<Gridicon icon="arrow-up" size={ 16 } />
						</span>
					</li>
					<li>
						<span className="description">{ translate( 'View All' ) }</span>
						<span className="shortcut letter">a</span>
					</li>
					<li>
						<span className="description">{ translate( 'View Unread' ) }</span>
						<span className="shortcut letter">u</span>
					</li>
					<li>
						<span className="description">{ translate( 'View Comments' ) }</span>
						<span className="shortcut letter">c</span>
					</li>
					<li>
						<span className="description">{ translate( 'View Subscribers' ) }</span>
						<span className="shortcut letter">f</span>
					</li>
					<li>
						<span className="description">{ translate( 'View Likes' ) }</span>
						<span className="shortcut letter">l</span>
					</li>
					<li>
						<span className="description">{ translate( 'Toggle Shortcuts Menu' ) }</span>
						<span className="shortcut letter">i</span>
					</li>
				</ul>
			</Popover>
		);
	};

	return (
		<>
			{ ! isMobile && ( // Hide the keyboard shortcuts button on mobile
				<HotkeyContainer
					shortcuts={ [
						{
							hotkey: 73, // i key number
							action: toggleShortcutsPopover,
						},
					] }
				>
					<button
						className={ clsx( 'wpnc__keyboard-shortcuts-button', {
							'active-action': isShortcutsPopoverOpen,
							'inactive-action': ! isShortcutsPopoverOpen,
						} ) }
						title={ translate( 'Open Keyboard Shortcuts' ) }
						onClick={ ( event ) => {
							event.stopPropagation();
							toggleShortcutsPopover();
						} }
						ref={ spanRef }
					>
						<Gridicon ref={ iconRef } icon="info-outline" size={ 18 } />
					</button>
				</HotkeyContainer>
			) }
			{ renderShortcutsPopover() }
		</>
	);
};

const mapStateToProps = ( state ) => ( {
	isPanelOpen: getIsPanelOpen( state ),
	isShortcutsPopoverOpen: getIsShortcutsPopoverOpen( state ),
	isMobile: isWithinBreakpoint( MOBILE_BREAKPOINT ),
} );

const mapDispatchToProps = {
	closeShortcutsPopover: actions.ui.closeShortcutsPopover,
	toggleShortcutsPopover: actions.ui.toggleShortcutsPopover,
};

export default connect( mapStateToProps, mapDispatchToProps )( ShortcutsPopover );

import { Popover } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import { connect } from 'react-redux';
import actions from '../state/actions';
import Gridicon from './gridicons';

export const ListHeader = ( { isFirst, title, viewSettings } ) => {
	const translate = useTranslate();

	// Use state to determine if the keyboard shortcuts are visible
	const [ shortcutsVisible, setShortcutsVisible ] = useState( false );

	// create context for the keyboard shortcuts popover icon
	const iconRef = useRef();
	const spanRef = useRef();

	// Add function to toggle the visibility of the keyboard shortcuts
	const toggleShortcutsVisible = () => {
		setShortcutsVisible( ! shortcutsVisible );
	};

	const closePopover = () => {
		setShortcutsVisible( false );
	};

	// This function renders a list of keyboard shortcuts
	const renderShortcutsPopover = () => {
		return (
			<Popover
				onClose={ closePopover }
				isVisible={ shortcutsVisible }
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
							<Gridicon icon="arrow-down" size={ 18 } />
						</span>
					</li>
					<li>
						<span className="description">{ translate( 'Previous' ) }</span>
						<span className="shortcut has-icon">
							<Gridicon icon="arrow-up" size={ 18 } />
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
				</ul>
			</Popover>
		);
	};

	return (
		<li className="wpnc__time-group-wrap">
			<div className="wpnc__time-group-title">
				<Gridicon icon="time" size={ 18 } />
				{ title }
				{ isFirst && (
					<>
						<span
							className="wpnc__settings"
							onClick={ viewSettings }
							onKeyDown={ ( e ) => {
								if ( e.key === 'Enter' ) {
									viewSettings();
								}
							} }
							aria-label={ translate( 'Open notification settings' ) }
							role="button"
							tabIndex="0"
						>
							<Gridicon icon="cog" size={ 18 } />
						</span>
						<span
							className="wpnc__keyboard-shortcuts-button"
							aria-label={ translate( 'Open Keyboard Shortcuts' ) }
							role="button"
							tabIndex="0"
							onClick={ toggleShortcutsVisible }
							ref={ spanRef }
							onKeyDown={ ( e ) => {
								if ( e.key === 'i' ) {
									toggleShortcutsVisible();
								}
							} }
						>
							<Gridicon ref={ iconRef } icon="info-outline" size={ 18 } />
						</span>
					</>
				) }
				{ renderShortcutsPopover() }
			</div>
		</li>
	);
};

const mapDispatchToProps = {
	viewSettings: actions.ui.viewSettings,
};

export default connect( null, mapDispatchToProps )( ListHeader );

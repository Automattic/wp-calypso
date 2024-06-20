import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { connect } from 'react-redux';
import actions from '../state/actions';
import Gridicon from './gridicons';

export const ListHeader = ( { isFirst, title, viewSettings } ) => {
	const translate = useTranslate();

	// Use state to determine if the keyboard shortcuts are visible
	const [ shortcutsVisible, setShortcutsVisible ] = useState( false );

	// This function toggles the visibility of the keyboard shortcuts
	const viewShortcuts = () => {
		setShortcutsVisible( ! shortcutsVisible );
	};

	// This function renders a list of keyboard shortcuts
	const renderShortcutsPopover = () => {
		// Render the keyboard shortcuts list
		return (
			<div className="wpnc__keyboard-shortcuts-popover">
				<h2>{ translate( 'Keyboard Shortcuts' ) }</h2>
				<ul>
					<li>
						<span className="shortcut">?</span>
						<span>{ translate( 'Show this help' ) }</span>
					</li>
				</ul>
			</div>
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
							onClick={ viewShortcuts }
							onKeyDown={ ( e ) => {
								if ( e.key === 'i' ) {
									viewShortcuts();
								}
							} }
							aria-label={ translate( 'Open Keyboard Shortcuts' ) }
							role="button"
							tabIndex="0"
						>
							<Gridicon icon="info-outline" size={ 18 } />
						</span>
						{ shortcutsVisible && renderShortcutsPopover() }
					</>
				) }
			</div>
		</li>
	);
};

const mapDispatchToProps = {
	viewSettings: actions.ui.viewSettings,
};

export default connect( null, mapDispatchToProps )( ListHeader );

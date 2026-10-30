import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { keyboard } from '@wordpress/icons';
import { Popover } from '@wordpress/ui';
import { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import actions from '../../panel/state/actions';
import getIsShortcutsPopoverOpen from '../../panel/state/selectors/get-is-shortcuts-popover-open';

import './style.scss';

const getShortcuts = () => [
	{ key: 'n', label: __( 'Toggle panel' ) },
	{ key: '↓', label: __( 'Next' ) },
	{ key: '↑', label: __( 'Previous' ) },
	{ key: '←', label: __( 'Left' ) },
	{ key: '→', label: __( 'Right' ) },
	{ key: 'a', label: __( 'View all' ) },
	{ key: 'u', label: __( 'View unread' ) },
	{ key: 'c', label: __( 'View comments' ) },
	{ key: 'f', label: __( 'View subscribers' ) },
	{ key: 'l', label: __( 'View likes' ) },
	{ key: 'i', label: __( 'Toggle shortcuts menu' ) },
];

/**
 * Renders the keyboard shortcuts button and the popover listing the panel's shortcuts.
 */
export default function NoteShortcuts() {
	const dispatch = useDispatch();
	const isOpen = useSelector( getIsShortcutsPopoverOpen );
	const containerRef = useRef< HTMLDivElement >( null );

	return (
		<div ref={ containerRef } className="wpnc__keyboard-shortcuts">
			<Popover.Root
				open={ isOpen }
				onOpenChange={ ( willOpen: boolean ) => {
					if ( willOpen !== isOpen ) {
						dispatch( actions.ui.toggleShortcutsPopover() );
					}
				} }
			>
				<Popover.Trigger
					render={ <Button size="small" icon={ keyboard } label={ __( 'Keyboard shortcuts' ) } /> }
				/>
				<Popover.Popup
					portal={ <Popover.Portal container={ containerRef } /> }
					positioner={ <Popover.Positioner align="end" /> }
				>
					<Popover.Title className="wpnc__keyboard-shortcuts-title">
						{ __( 'Keyboard shortcuts' ) }
					</Popover.Title>
					<ul className="wpnc__keyboard-shortcuts-list">
						{ getShortcuts().map( ( { key, label } ) => (
							<li key={ key }>
								<kbd>{ key }</kbd>
								{ label }
							</li>
						) ) }
					</ul>
				</Popover.Popup>
			</Popover.Root>
		</div>
	);
}

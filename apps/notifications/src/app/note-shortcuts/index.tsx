import { MenuItem } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useRef, useEffect } from 'react';

import './style.scss';

function ShortcutIcon( { letter }: { letter: string } ) {
	return <span className="shortcut letter">{ letter }</span>;
}

function Shortcut( { letter, title }: { letter: string; title: string } ) {
	return (
		<MenuItem
			disabled
			icon={ <ShortcutIcon letter={ letter } /> }
			iconPosition="left"
			style={ { color: 'inherit' } }
		>
			{ title }
		</MenuItem>
	);
}

export default function NoteShortcuts() {
	// Ensure the component has a focused wrapper container
	// so that event handlers work when it is rendered inside a <Popover>.
	const focusRef = useRef< HTMLDivElement >( null );
	useEffect( () => {
		focusRef.current?.focus();
	}, [] );

	return (
		<div tabIndex={ -1 } ref={ focusRef } className="wpnc__keyboard-shortcuts-popover">
			<Shortcut letter="n" title={ __( 'Toggle panel' ) } />
			<Shortcut letter="↓" title={ __( 'Next' ) } />
			<Shortcut letter="↑" title={ __( 'Previous' ) } />
			<Shortcut letter="←" title={ __( 'Left' ) } />
			<Shortcut letter="→" title={ __( 'Right' ) } />
			<Shortcut letter="a" title={ __( 'View all' ) } />
			<Shortcut letter="u" title={ __( 'View unread' ) } />
			<Shortcut letter="c" title={ __( 'View comments' ) } />
			<Shortcut letter="f" title={ __( 'View subscribers' ) } />
			<Shortcut letter="l" title={ __( 'View likes' ) } />
			<Shortcut letter="i" title={ __( 'Toggle shortcuts menu' ) } />
		</div>
	);
}

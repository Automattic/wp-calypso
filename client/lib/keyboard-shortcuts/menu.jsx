/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Dialog from 'client/components/dialog';
import config from 'config';
import KeyboardShortcuts from 'client/lib/keyboard-shortcuts';
import KeyBindings from 'client/lib/keyboard-shortcuts/key-bindings';

class KeyboardShortcutsMenu extends React.Component {
	static displayName = 'KeyboardShortcutsMenu';

	state = {
		showDialog: false,
	};

	componentDidMount() {
		KeyBindings.on( 'language-change', this.handleLanguageChange );
		KeyboardShortcuts.on( 'open-keyboard-shortcuts-menu', this.toggleShowDialog );
	}

	componentWillUnmount() {
		KeyBindings.off( 'language-change', this.handleLanguageChange );
		KeyboardShortcuts.off( 'open-keyboard-shortcuts-menu', this.toggleShowDialog );
	}

	handleLanguageChange = () => {
		// if the language changes, force a re-render to get the translated key-binding descriptions
		this.forceUpdate();
	};

	closeDialog = () => {
		this.setState( { showDialog: false } );
	};

	toggleShowDialog = () => {
		this.setState( { showDialog: ! this.state.showDialog } );
	};

	getShortcutsByCategory = () => {
		var allShortcuts = KeyBindings.get(),
			shortcutsByCategory = [
				{
					name: this.props.translate( 'List Navigation' ),
					shortcuts: allShortcuts.listNavigation,
					className: 'keyboard-shortcuts__list-navigation',
					disabled: true,
				},
				{
					name: this.props.translate( 'Site Navigation' ),
					shortcuts: allShortcuts.siteNavigation,
					className: 'keyboard-shortcuts__site-navigation',
				},
				{
					name: this.props.translate( 'Reader' ),
					shortcuts: allShortcuts.reader,
					className: 'keyboard-shortcuts__reader',
					disabled: true,
				},
				{
					name: this.props.translate( 'Blog Posts and Pages' ),
					shortcuts: allShortcuts.blogPostsAndPages,
					className: 'keyboard-shortcuts__blog-posts-and-pages',
					disabled: true,
				},
			];

		if ( config.isEnabled( 'devdocs' ) ) {
			shortcutsByCategory = shortcutsByCategory.concat( {
				name: this.props.translate( 'Developer' ),
				shortcuts: allShortcuts.developer,
				className: 'keyboard-shortcuts__developer',
			} );
		}

		return shortcutsByCategory.map( function( category ) {
			var classes = {};
			classes[ 'keyboard-shortcuts__category' ] = true;
			classes[ category.className ] = true;
			classes[ 'keyboard-shortcuts__category-disabled' ] = category.disabled;

			return (
				<li className={ classNames( classes ) } key={ category.name }>
					<h3>{ category.name }</h3>
					<ul className="keyboard-shortcuts__list">
						{ this.getShortcutList( category.shortcuts ) }
					</ul>
				</li>
			);
		}, this );
	};

	getShortcutList = shortcuts => {
		return shortcuts.map( function( shortcut ) {
			// process the list of keys in this shortcut into individual elements
			var keys = shortcut.description.keys.map( function( key, index ) {
				return (
					<div className="keyboard-shortcuts__key" key={ shortcut.eventName + index }>
						{ key }
					</div>
				);
			} );

			return (
				<li key={ shortcut.eventName }>
					<div className="keyboard-shortcuts__keys">{ keys }</div>
					<div className="keyboard-shortcuts__description">{ shortcut.description.text }</div>
				</li>
			);
		}, this );
	};

	render() {
		return (
			<Dialog
				additionalClassNames="keyboard-shortcuts"
				isVisible={ this.state.showDialog }
				onClose={ this.closeDialog }
			>
				<h1 className="keyboard-shortcuts__title">
					{ this.props.translate( 'Keyboard Shortcuts' ) }
				</h1>
				<ul className="keyboard-shortcuts__categories">{ this.getShortcutsByCategory() }</ul>
			</Dialog>
		);
	}
}

export default localize( KeyboardShortcutsMenu );

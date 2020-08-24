/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { Dialog } from '@automattic/components';
import config from 'config';
import KeyboardShortcuts from 'lib/keyboard-shortcuts';
import KEY_BINDINGS from 'lib/keyboard-shortcuts/key-bindings';

/**
 * Style dependencies
 */
import './menu.scss';

class KeyboardShortcutsMenu extends React.Component {
	state = {
		showDialog: false,
	};

	componentDidMount() {
		KeyboardShortcuts.on( 'open-keyboard-shortcuts-menu', this.toggleShowDialog );
	}

	componentWillUnmount() {
		KeyboardShortcuts.off( 'open-keyboard-shortcuts-menu', this.toggleShowDialog );
	}

	closeDialog = () => {
		this.setState( { showDialog: false } );
	};

	toggleShowDialog = () => {
		this.setState( { showDialog: ! this.state.showDialog } );
	};

	getShortcutsByCategory() {
		const allShortcuts = KEY_BINDINGS;
		const shortcutsByCategory = [
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
			shortcutsByCategory.push( {
				name: this.props.translate( 'Developer' ),
				shortcuts: allShortcuts.developer,
				className: 'keyboard-shortcuts__developer',
			} );
		}

		return shortcutsByCategory.map( ( category ) => {
			const className = classNames( 'keyboard-shortcuts__category', category.className, {
				'keyboard-shortcuts__category-disabled': category.disabled,
			} );

			return (
				<li className={ className } key={ category.name }>
					<h3>{ category.name }</h3>
					<ul className="keyboard-shortcuts__list">
						{ this.getShortcutList( category.shortcuts ) }
					</ul>
				</li>
			);
		} );
	}

	getShortcutList( shortcuts ) {
		return shortcuts.map( ( shortcut ) => {
			// some shortcuts, like 'open-support-user', don't have a description
			if ( ! shortcut.description ) {
				return null;
			}

			// process the list of keys in this shortcut into individual elements
			const keys = shortcut.description.keys.map( ( key, index ) => (
				<div className="keyboard-shortcuts__key" key={ shortcut.eventName + index }>
					{ key }
				</div>
			) );

			// `description.text` is a function that takes a `translate` function as argument
			// and returns a translated string.
			const text = shortcut.description.text( this.props.translate );

			return (
				<li key={ shortcut.eventName }>
					<div className="keyboard-shortcuts__keys">{ keys }</div>
					<div className="keyboard-shortcuts__description">{ text }</div>
				</li>
			);
		} );
	}

	render() {
		if ( ! this.state.showDialog ) {
			return null;
		}

		return (
			<Dialog isVisible additionalClassNames="keyboard-shortcuts" onClose={ this.closeDialog }>
				<h1 className="keyboard-shortcuts__title">
					{ this.props.translate( 'Keyboard Shortcuts' ) }
				</h1>
				<ul className="keyboard-shortcuts__categories">{ this.getShortcutsByCategory() }</ul>
			</Dialog>
		);
	}
}

export default localize( KeyboardShortcutsMenu );

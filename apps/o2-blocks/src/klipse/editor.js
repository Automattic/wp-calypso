/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { registerBlockType } from '@wordpress/blocks';

/**
 * WordPress dependencies
 */
import { DropdownMenu, Toolbar } from '@wordpress/components';
import { BlockControls } from '@wordpress/editor';
import { __ } from '@wordpress/i18n';

const attributes = {
	code: { type: 'string' },
	language: { type: 'string', default: 'JavaScript' },
};

const languageClassName = language => {
	switch ( language ) {
		case 'Clojure':
			return 'language-klipse-eval-clojure';
		case 'C++':
			return 'language-klipse-eval-cpp';
		case 'Common Lisp':
			return 'language-klipse-eval-clisp';
		case 'JavaScript':
			return 'language-klipse-eval-js';
		case 'Markdown':
			return 'language-klipse-eval-markdown';
		case 'OCaml':
			return 'language-klipse-eval-ocaml';
		case 'OCaml (to JS)':
			return 'language-klipse-transpile-ocaml';
		case 'PHP':
			return 'language-klipse-eval-php';
		case 'Python':
			return 'language-klipse-eval-python';
		case 'Prolog (Rules)':
			return 'language-klipse-prolog-rules';
		case 'Prolog (Query)':
			return 'language-klipse-prolog-query';
		case 'Ruby':
			return 'language-klipse-eval-ruby';
		case 'Scheme':
			return 'language-klipse-eval-scheme';
		default:
			return '';
	}
};

let alreadyStarted = false;
let handle;

const refreshEditors = () => {
	if ( handle ) {
		clearTimeout( handle );
	}

	handle = setTimeout( () => {
		handle = null;
		try {
			window.klipse.plugin.init( window.klipse_settings );
		} catch ( e ) {
			return;
		}
	}, 200 );
};

class KlipseEditor extends Component {
	wrapper = React.createRef();
	editor = null;

	componentDidMount() {
		if ( alreadyStarted ) {
			this.refreshEditors();
			return;
		}

		alreadyStarted = true;
		window.__klipseBoot( this.refreshEditors );
	}

	componentDidUpdate() {
		this.refreshEditors();
	}

	findMe = () => {
		try {
			const index = Object.keys( window.klipse_editors ).find(
				i =>
					window.klipse_editors[ i ].display.wrapper.parentNode.parentNode === this.wrapper.current
			);

			return index === null ? false : window.klipse_editors[ index ];
		} catch ( e ) {
			return false;
		}
	};

	waitForMe = () =>
		new Promise( resolve => {
			const loop = () => {
				const me = this.findMe();

				if ( me ) {
					return resolve( me );
				}

				setTimeout( loop, 100 );
			};

			loop();
		} );

	refreshEditors = async () => {
		refreshEditors();

		const me = await this.waitForMe();
		me.on( 'change', e => this.props.setAttributes( { code: e.getValue() } ) );
	};

	getLanguages = () =>
		[
			'Clojure',
			'Common Lisp',
			'C++',
			'JavaScript',
			'Markdown',
			'OCaml',
			'OCaml (to JS)',
			'PHP',
			'Prolog (Rules)',
			'Prolog (Query)',
			'Python',
			'Ruby',
			'Scheme',
		].map( language => ( {
			icon: 'editor-code',
			title: language,
			isDisabled: false,
			onClick: () => this.props.setAttributes( { language } ),
		} ) );

	render() {
		const {
			attributes: { code, language },
			className,
		} = this.props;

		return (
			<Fragment>
				<BlockControls>
					<Toolbar>
						<span style={ { margin: '2px 0 4px 8px' } }>{ language }</span>
						<DropdownMenu
							icon="editor-code"
							label={ __( 'Language' ) }
							controls={ this.getLanguages() }
						/>
					</Toolbar>
				</BlockControls>
				<div className={ className }>
					<pre ref={ this.wrapper } key={ language }>
						<code className={ languageClassName( language ) }>{ code }</code>
					</pre>
				</div>
			</Fragment>
		);
	}
}

const save = ( { attributes: { code, language }, className } ) => (
	<div className={ className }>
		<pre>
			<code className={ languageClassName( language ) }>{ code }</code>
		</pre>
	</div>
);

registerBlockType( 'a8c/klipse', {
	title: __( 'KLIPSE code evaluator' ),
	description: __(
		'Write some code in a variety of languages and watch it evaluate interactively as you go!'
	),
	icon: 'editor-code',
	category: 'common',
	attributes,
	edit: KlipseEditor,
	save,
	supports: {
		html: false,
	},
} );

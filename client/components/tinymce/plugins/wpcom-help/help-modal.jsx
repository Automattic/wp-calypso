import { forEach } from 'lodash';
import { localize } from 'i18n-calypso';

/* eslint-disable no-multi-spaces */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';

import FormButton from 'components/forms/form-button';

const HelpModal = React.createClass( {

	propTypes: {
		onClose: PropTypes.func,
		macosx: PropTypes.bool,
		showDialog: PropTypes.bool
	},

	defaultShortcuts() {
		return [
			{ c: this.props.translate( 'Copy' ),      x: this.props.translate( 'Cut' )              },
			{ v: this.props.translate( 'Paste' ),     a: this.props.translate( 'Select all' )       },
			{ z: this.props.translate( 'Undo' ),      y: this.props.translate( 'Redo' )             },
			{ b: this.props.translate( 'Bold' ),      i: this.props.translate( 'Italic' )           },
			{ u: this.props.translate( 'Underline' ), k: this.props.translate( 'Insert/edit link' ) }
		];
	},

	additionalShortcuts() {
		return [
			{ 1: this.props.translate( 'Heading 1' ),             2: this.props.translate( 'Heading 2' ) },
			{ 3: this.props.translate( 'Heading 3' ),             4: this.props.translate( 'Heading 4' ) },
			{ 5: this.props.translate( 'Heading 5' ),             6: this.props.translate( 'Heading 6' ) },
			{ l: this.props.translate( 'Align left' ),            c: this.props.translate( 'Align center' ) },
			{ r: this.props.translate( 'Align right' ),           j: this.props.translate( 'Justify' ) },
			{ d: this.props.translate( 'Strikethrough' ),         q: this.props.translate( 'Blockquote' ) },
			{ u: this.props.translate( 'Bullet list' ),           o: this.props.translate( 'Numbered list' ) },
			{ a: this.props.translate( 'Insert/edit link' ),      s: this.props.translate( 'Remove link' ) },
			{ m: this.props.translate( 'Insert/edit image' ),     t: this.props.translate( 'Insert Read More tag' ) },
			{ h: this.props.translate( 'Keyboard Shortcuts' ),    x: this.props.translate( 'Code' ) },
			{ p: this.props.translate( 'Insert Page Break tag' ) }
		];
	},

	renderRow( row, index ) {
		const columns = [];

		forEach( row, ( text, key ) => {
			columns.push(
				<th className="wpcom-help__key" key={ key }><kbd>{ key }</kbd></th>
			);
			columns.push( <td className="wpcom-help__action" key={ text }>{ text }</td> );
		} );

		return <tr key={ index }>{ columns }</tr>;
	},

	getButtons() {
		return [
			<FormButton
				key="close"
				isPrimary={ false }
				onClick={ this.props.onClose }>
					{ this.props.translate( 'Close' ) }
			</FormButton>
		];
	},

	getKeyLabel() {
		return this.props.translate( 'Key', { context: 'Computer key used in keyboard shortcut' } );
	},

	getActionLabel() {
		return this.props.translate( 'Action', { context: 'Action taken when pressing keyboard shortcut' } );
	},

	getTableHead() {
		return (
			<thead>
				<tr>
					<th className="wpcom-help__key">{ this.getKeyLabel() }</th>
					<th className="wpcom-help__action">{ this.getActionLabel() }</th>
					<th className="wpcom-help__key">{ this.getKeyLabel() }</th>
					<th className="wpcom-help__action">{ this.getActionLabel() }</th>
				</tr>
			</thead>
		);
	},

	render() {
		const defaultText = this.props.macosx ?
			this.props.translate( 'Default shortcuts, Command + key:', { context: 'Mac shortcuts' } ) :
			this.props.translate( 'Default shortcuts, Ctrl + key:', { context: 'Windows shortcuts' } );

		const additionalText = this.props.macosx ?
			this.props.translate( 'Additional shortcuts, Control + Option + key:', { context: 'Mac shortcuts' } ) :
			this.props.translate( 'Additional shortcuts, Shift + Alt + key:', { context: 'Windows shortcuts' } );

		return (
		    <Dialog
				isVisible={ this.props.showDialog }
				buttons={ this.getButtons() }
				additionalClassNames="wpcom-help__dialog"
				onClose={ this.props.onClose }>
				<h2 className="wpcom-help__heading">{ this.props.translate( 'Keyboard Shortcuts' ) }</h2>
				<p>{ defaultText }</p>
				<table className="wpcom-help__table">
					{ this.getTableHead() }
					<tbody>
						{ this.defaultShortcuts().map( this.renderRow, this ) }
					</tbody>
				</table>
				<p>{ additionalText }</p>
				<table className="wpcom-help__table">
					{ this.getTableHead() }
					<tbody>
						{ this.additionalShortcuts().map( this.renderRow, this ) }
					</tbody>
				</table>
			</Dialog>
		);
	}

} );

export default localize( HelpModal );

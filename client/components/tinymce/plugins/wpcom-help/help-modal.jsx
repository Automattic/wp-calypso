/* eslint-disable no-multi-spaces */

/**
 * External dependencies
 */
import { forEach } from 'lodash';
const PropTypes = require('prop-types');
const React = require( 'react' );

/**
 * Internal dependencies
 */
const Dialog = require( 'components/dialog' ),
	FormButton = require( 'components/forms/form-button' );

const HelpModal = React.createClass( {

	propTypes: {
		onClose: PropTypes.func,
		macosx: PropTypes.bool,
		showDialog: PropTypes.bool
	},

	defaultShortcuts() {
		return [
			{ c: this.translate( 'Copy' ),      x: this.translate( 'Cut' )              },
			{ v: this.translate( 'Paste' ),     a: this.translate( 'Select all' )       },
			{ z: this.translate( 'Undo' ),      y: this.translate( 'Redo' )             },
			{ b: this.translate( 'Bold' ),      i: this.translate( 'Italic' )           },
			{ u: this.translate( 'Underline' ), k: this.translate( 'Insert/edit link' ) }
		];
	},

	additionalShortcuts() {
		return [
			{ 1: this.translate( 'Heading 1' ),             2: this.translate( 'Heading 2' ) },
			{ 3: this.translate( 'Heading 3' ),             4: this.translate( 'Heading 4' ) },
			{ 5: this.translate( 'Heading 5' ),             6: this.translate( 'Heading 6' ) },
			{ l: this.translate( 'Align left' ),            c: this.translate( 'Align center' ) },
			{ r: this.translate( 'Align right' ),           j: this.translate( 'Justify' ) },
			{ d: this.translate( 'Strikethrough' ),         q: this.translate( 'Blockquote' ) },
			{ u: this.translate( 'Bullet list' ),           o: this.translate( 'Numbered list' ) },
			{ a: this.translate( 'Insert/edit link' ),      s: this.translate( 'Remove link' ) },
			{ m: this.translate( 'Insert/edit image' ),     t: this.translate( 'Insert Read More tag' ) },
			{ h: this.translate( 'Keyboard Shortcuts' ),    x: this.translate( 'Code' ) },
			{ p: this.translate( 'Insert Page Break tag' ) }
		];
	},

	renderRow( row, index ) {
		let columns = [];

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
					{ this.translate( 'Close' ) }
			</FormButton>
		];
	},

	getKeyLabel() {
		return this.translate( 'Key', { context: 'Computer key used in keyboard shortcut' } );
	},

	getActionLabel() {
		return this.translate( 'Action', { context: 'Action taken when pressing keyboard shortcut' } );
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
			this.translate( 'Default shortcuts, Command + key:', { context: 'Mac shortcuts' } ) :
			this.translate( 'Default shortcuts, Ctrl + key:', { context: 'Windows shortcuts' } );

		const additionalText = this.props.macosx ?
			this.translate( 'Additional shortcuts, Control + Option + key:', { context: 'Mac shortcuts' } ) :
			this.translate( 'Additional shortcuts, Shift + Alt + key:', { context: 'Windows shortcuts' } );

		return (
			<Dialog
				isVisible={ this.props.showDialog }
				buttons={ this.getButtons() }
				additionalClassNames="wpcom-help__dialog"
				onClose={ this.props.onClose }>
				<h2 className="wpcom-help__heading">{ this.translate( 'Keyboard Shortcuts' ) }</h2>
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

module.exports = HelpModal;

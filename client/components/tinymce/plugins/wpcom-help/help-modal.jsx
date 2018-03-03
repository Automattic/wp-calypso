/**
 * /* eslint-disable no-multi-spaces
 *
 * @format
 */

/**
 * External dependencies
 */
import { forEach } from 'lodash';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import FormButton from 'components/forms/form-button';

class HelpModal extends React.Component {
	static propTypes = {
		onClose: PropTypes.func,
		macosx: PropTypes.bool,
		showDialog: PropTypes.bool,
	};

	defaultShortcuts = () => {
		const { translate } = this.props;
		return [
			[ { key: 'c', action: translate( 'Copy' ) }, { key: 'x', action: translate( 'Cut' ) } ],
			[
				{ key: 'v', action: translate( 'Paste' ) },
				{ key: 'a', action: translate( 'Select all' ) },
			],
			[ { key: 'z', action: translate( 'Undo' ) }, { key: 'y', action: translate( 'Redo' ) } ],
			[ { key: 'b', action: translate( 'Bold' ) }, { key: 'i', action: translate( 'Italic' ) } ],
			[
				{ key: 'u', action: translate( 'Underline' ) },
				{ key: 'k', action: translate( 'Insert/edit link' ) },
			],
		];
	};

	additionalShortcuts = () => {
		const { translate } = this.props;
		return [
			[
				{ key: 1, action: translate( 'Heading 1' ) },
				{ key: 2, action: translate( 'Heading 2' ) },
			],
			[
				{ key: 3, action: translate( 'Heading 3' ) },
				{ key: 4, action: translate( 'Heading 4' ) },
			],
			[
				{ key: 5, action: translate( 'Heading 5' ) },
				{ key: 6, action: translate( 'Heading 6' ) },
			],
			[
				{ key: 'l', action: translate( 'Align left' ) },
				{ key: 'c', action: translate( 'Align center' ) },
			],
			[
				{ key: 'r', action: translate( 'Align right' ) },
				{ key: 'j', action: translate( 'Justify' ) },
			],
			[
				{ key: 'd', action: translate( 'Strikethrough' ) },
				{ key: 'q', action: translate( 'Blockquote' ) },
			],
			[
				{ key: 'u', action: translate( 'Bulleted list' ) },
				{ key: 'o', action: translate( 'Numbered list' ) },
			],
			[
				{ key: 'a', action: translate( 'Insert/edit link' ) },
				{ key: 's', action: translate( 'Remove link' ) },
			],
			[
				{ key: 'm', action: translate( 'Insert/edit image' ) },
				{ key: 't', action: translate( 'Insert Read More tag' ) },
			],
			[
				{ key: 'h', action: translate( 'Keyboard Shortcuts' ) },
				{ key: 'x', action: translate( 'Code' ) },
			],
			[ { key: 'p', action: translate( 'Insert Page Break tag' ) } ],
		];
	};

	spaceFormatShortcuts = () => {
		const { translate } = this.props;
		return [
			[
				{ key: '*', action: translate( 'Bulleted list' ) },
				{ key: '1.', action: translate( 'Numbered list' ) },
			],
			[
				{ key: '-', action: translate( 'Bulleted list' ) },
				{ key: '1)', action: translate( 'Numbered list' ) },
			],
		];
	};

	enterFormatShortcuts = () => {
		const { translate } = this.props;
		return [
			[
				{ key: '>', action: translate( 'Blockquote' ) },
				{ key: '##', action: translate( 'Heading 2' ) },
			],
			[
				{ key: '###', action: translate( 'Heading 3' ) },
				{ key: '####', action: translate( 'Heading 4' ) },
			],
			[
				{ key: '#####', action: translate( 'Heading 5' ) },
				{ key: '######', action: translate( 'Heading 6' ) },
			],
			[ { key: '---', action: translate( 'Horizontal line' ) } ],
		];
	};

	renderRow = ( row, index ) => {
		let columns = [];

		forEach( row, ( obj, i ) => {
			columns.push(
				<th className="wpcom-help__key" key={ 'key-' + index + i }>
					<kbd>{ obj.key }</kbd>
				</th>
			);
			columns.push(
				<td className="wpcom-help__action" key={ 'action-' + index + i }>
					{ obj.action }
				</td>
			);
		} );

		return <tr key={ index }>{ columns }</tr>;
	};

	getButtons = () => {
		return [
			<FormButton key="close" isPrimary={ false } onClick={ this.props.onClose }>
				{ this.props.translate( 'Close' ) }
			</FormButton>,
		];
	};

	getKeyLabel = () => {
		return this.props.translate( 'Key', { context: 'Computer key used in keyboard shortcut' } );
	};

	getActionLabel = () => {
		return this.props.translate( 'Action', {
			context: 'Action taken when pressing keyboard shortcut',
		} );
	};

	getTableHead = () => {
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
	};

	render() {
		const translate = this.props.translate;
		const defaultText = this.props.macosx
			? translate( 'Default shortcuts, Command + key:', { context: 'Mac shortcuts' } )
			: translate( 'Default shortcuts, Ctrl + key:', { context: 'Windows shortcuts' } );

		const additionalText = this.props.macosx
			? translate( 'Additional shortcuts, Control + Option + key:', {
					context: 'Mac shortcuts',
				} )
			: translate( 'Additional shortcuts, Shift + Alt + key:', {
					context: 'Windows shortcuts',
				} );

		const spaceFormatText = translate( 'Formatting shortcuts, key, then space:' );

		const enterFormatText = translate( 'Formatting shortcuts, key, then Enter:' );

		return (
			<Dialog
				isVisible={ this.props.showDialog }
				buttons={ this.getButtons() }
				additionalClassNames="wpcom-help__dialog"
				onClose={ this.props.onClose }
			>
				<h2 className="wpcom-help__heading">{ translate( 'Keyboard Shortcuts' ) }</h2>
				<p>{ defaultText }</p>
				<table className="wpcom-help__table">
					{ this.getTableHead() }
					<tbody>{ this.defaultShortcuts().map( this.renderRow, this ) }</tbody>
				</table>
				<p>{ additionalText }</p>
				<table className="wpcom-help__table">
					{ this.getTableHead() }
					<tbody>{ this.additionalShortcuts().map( this.renderRow, this ) }</tbody>
				</table>
				<p>{ spaceFormatText }</p>
				<table className="wpcom-help__table">
					{ this.getTableHead() }
					<tbody>{ this.spaceFormatShortcuts().map( this.renderRow, this ) }</tbody>
				</table>
				<p>{ enterFormatText }</p>
				<table className="wpcom-help__table">
					{ this.getTableHead() }
					<tbody>{ this.enterFormatShortcuts().map( this.renderRow, this ) }</tbody>
				</table>
			</Dialog>
		);
	}
}

export default localize( HelpModal );

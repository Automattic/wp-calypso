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
			[
				{ shortcut: 'c', action: translate( 'Copy' ) },
				{ shortcut: 'x', action: translate( 'Cut' ) },
			],
			[
				{ shortcut: 'v', action: translate( 'Paste' ) },
				{ shortcut: 'a', action: translate( 'Select all' ) },
			],
			[
				{ shortcut: 'z', action: translate( 'Undo' ) },
				{ shortcut: 'y', action: translate( 'Redo' ) },
			],
			[
				{ shortcut: 'b', action: translate( 'Bold' ) },
				{ shortcut: 'i', action: translate( 'Italic' ) },
			],
			[
				{ shortcut: 'u', action: translate( 'Underline' ) },
				{ shortcut: 'k', action: translate( 'Insert/edit link' ) },
			],
		];
	};

	additionalShortcuts = () => {
		const { translate } = this.props;
		return [
			[
				{ shortcut: 1, action: translate( 'Heading 1' ) },
				{ shortcut: 2, action: translate( 'Heading 2' ) },
			],
			[
				{ shortcut: 3, action: translate( 'Heading 3' ) },
				{ shortcut: 4, action: translate( 'Heading 4' ) },
			],
			[
				{ shortcut: 5, action: translate( 'Heading 5' ) },
				{ shortcut: 6, action: translate( 'Heading 6' ) },
			],
			[
				{ shortcut: 'l', action: translate( 'Align left' ) },
				{ shortcut: 'c', action: translate( 'Align center' ) },
			],
			[
				{ shortcut: 'r', action: translate( 'Align right' ) },
				{ shortcut: 'j', action: translate( 'Justify' ) },
			],
			[
				{ shortcut: 'd', action: translate( 'Strikethrough' ) },
				{ shortcut: 'q', action: translate( 'Blockquote' ) },
			],
			[
				{ shortcut: 'u', action: translate( 'Bulleted list' ) },
				{ shortcut: 'o', action: translate( 'Numbered list' ) },
			],
			[
				{ shortcut: 'a', action: translate( 'Insert/edit link' ) },
				{ shortcut: 's', action: translate( 'Remove link' ) },
			],
			[
				{ shortcut: 'm', action: translate( 'Insert/edit image' ) },
				{ shortcut: 't', action: translate( 'Insert Read More tag' ) },
			],
			[
				{ shortcut: 'h', action: translate( 'Keyboard Shortcuts' ) },
				{ shortcut: 'x', action: translate( 'Code' ) },
			],
			[ { shortcut: 'p', action: translate( 'Insert Page Break tag' ) } ],
		];
	};

	spaceFormatShortcuts = () => {
		const { translate } = this.props;
		return [
			[
				{ shortcut: '*', action: translate( 'Bulleted list' ) },
				{ shortcut: '1.', action: translate( 'Numbered list' ) },
			],
			[
				{ shortcut: '-', action: translate( 'Bulleted list' ) },
				{ shortcut: '1)', action: translate( 'Numbered list' ) },
			],
		];
	};

	enterFormatShortcuts = () => {
		const { translate } = this.props;
		return [
			[
				{ shortcut: '>', action: translate( 'Blockquote' ) },
				{ shortcut: '##', action: translate( 'Heading 2' ) },
			],
			[
				{ shortcut: '###', action: translate( 'Heading 3' ) },
				{ shortcut: '####', action: translate( 'Heading 4' ) },
			],
			[
				{ shortcut: '#####', action: translate( 'Heading 5' ) },
				{ shortcut: '######', action: translate( 'Heading 6' ) },
			],
			[ { shortcut: '---', action: translate( 'Horizontal line' ) } ],
		];
	};

	renderRow = ( row, rowIndex ) => {
		const columns = [];

		forEach( row, cellPair => {
			columns.push(
				<th className="wpcom-help__key" key={ cellPair.shortcut }>
					<kbd>{ cellPair.shortcut }</kbd>
				</th>
			);
			columns.push(
				<td className="wpcom-help__action" key={ cellPair.action }>
					{ cellPair.action }
				</td>
			);
		} );

		return <tr key={ rowIndex }>{ columns }</tr>;
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
			? translate( 'Default shortcuts. Command + key:', { context: 'Mac shortcuts' } )
			: translate( 'Default shortcuts. Ctrl + key:', { context: 'Windows shortcuts' } );

		const additionalText = this.props.macosx
			? translate( 'Additional shortcuts. Control + Option + key:', {
					context: 'Mac shortcuts',
			  } )
			: translate( 'Additional shortcuts. Shift + Alt + key:', {
					context: 'Windows shortcuts',
			  } );

		const tableHead = this.getTableHead();

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
					{ tableHead }
					<tbody>{ this.defaultShortcuts().map( this.renderRow, this ) }</tbody>
				</table>
				<p>{ additionalText }</p>
				<table className="wpcom-help__table">
					{ tableHead }
					<tbody>{ this.additionalShortcuts().map( this.renderRow, this ) }</tbody>
				</table>
				<p>
					{ translate(
						'Formatting shortcuts. Start a new paragraph with the shortcut and press Space to apply the formatting.'
					) }
				</p>
				<table className="wpcom-help__table">
					<tbody>{ this.spaceFormatShortcuts().map( this.renderRow, this ) }</tbody>
				</table>
				<p>
					{ translate(
						'Formatting shortcuts. These shortcuts are turned into formatting when you press Enter.'
					) }
				</p>
				<table className="wpcom-help__table">
					<tbody>{ this.enterFormatShortcuts().map( this.renderRow, this ) }</tbody>
				</table>
			</Dialog>
		);
	}
}

export default localize( HelpModal );

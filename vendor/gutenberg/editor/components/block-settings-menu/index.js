/**
 * External dependencies
 */
import classnames from 'classnames';
import { castArray } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { IconButton, Dropdown, NavigableMenu } from '@wordpress/components';
import { withDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import './style.scss';
import BlockModeToggle from './block-mode-toggle';
import BlockDuplicateButton from './block-duplicate-button';
import BlockRemoveButton from './block-remove-button';
import SharedBlockConvertButton from './shared-block-convert-button';
import SharedBlockDeleteButton from './shared-block-delete-button';
import UnknownConverter from './unknown-converter';
import HTMLConverter from './html-converter';
import _BlockSettingsMenuFirstItem from './block-settings-menu-first-item';

export class BlockSettingsMenu extends Component {
	constructor() {
		super( ...arguments );
		this.state = {
			isFocused: false,
		};
		this.onFocus = this.onFocus.bind( this );
		this.onBlur = this.onBlur.bind( this );
	}

	onFocus() {
		this.setState( {
			isFocused: true,
		} );
	}

	onBlur() {
		this.setState( {
			isFocused: false,
		} );
	}

	render() {
		const {
			uids,
			onSelect,
			focus,
			rootUID,
			isHidden,
		} = this.props;
		const { isFocused } = this.state;
		const blockUIDs = castArray( uids );
		const count = blockUIDs.length;
		const firstBlockUID = blockUIDs[ 0 ];

		return (
			<div className="editor-block-settings-menu">
				<Dropdown
					contentClassName="editor-block-settings-menu__popover"
					position="bottom left"
					renderToggle={ ( { onToggle, isOpen } ) => {
						const toggleClassname = classnames( 'editor-block-settings-menu__toggle', {
							'is-opened': isOpen,
							'is-visible': isFocused || isOpen || ! isHidden,
						} );
						const label = isOpen ? __( 'Hide Options' ) : __( 'More Options' );

						return (
							<IconButton
								className={ toggleClassname }
								onClick={ () => {
									if ( count === 1 ) {
										onSelect( firstBlockUID );
									}
									onToggle();
								} }
								icon="ellipsis"
								label={ label }
								aria-expanded={ isOpen }
								focus={ focus }
								onFocus={ this.onFocus }
								onBlur={ this.onBlur }
							/>
						);
					} }
					renderContent={ ( { onClose } ) => (
						// Should this just use a DropdownMenu instead of a DropDown ?
						<NavigableMenu className="editor-block-settings-menu__content">
							<_BlockSettingsMenuFirstItem.Slot fillProps={ { onClose } } />
							{ count === 1 && <BlockModeToggle uid={ firstBlockUID } onToggle={ onClose } role="menuitem" /> }
							{ count === 1 && <UnknownConverter uid={ firstBlockUID } role="menuitem" /> }
							{ count === 1 && <HTMLConverter uid={ firstBlockUID } role="menuitem" /> }
							<BlockDuplicateButton uids={ uids } rootUID={ rootUID } role="menuitem" />
							{ count === 1 && <SharedBlockConvertButton uid={ firstBlockUID } onToggle={ onClose } itemsRole="menuitem" /> }
							<div className="editor-block-settings-menu__separator" />
							{ count === 1 && <SharedBlockDeleteButton uid={ firstBlockUID } onToggle={ onClose } itemsRole="menuitem" /> }
							<BlockRemoveButton uids={ uids } role="menuitem" />
						</NavigableMenu>
					) }
				/>
			</div>
		);
	}
}

export default withDispatch( ( dispatch ) => ( {
	onSelect( uid ) {
		dispatch( 'core/editor' ).selectBlock( uid );
	},
} ) )( BlockSettingsMenu );

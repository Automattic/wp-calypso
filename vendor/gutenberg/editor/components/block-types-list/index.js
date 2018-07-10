/**
 * External dependencies
 */
import classnames from 'classnames';
import { noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';
import { getBlockMenuDefaultClassName } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import './style.scss';
import BlockIcon from '../block-icon';

class BlockTypesList extends Component {
	render() {
		const { items, onSelect, onHover = noop } = this.props;

		return (
			/*
			 * Disable reason: The `list` ARIA role is redundant but
			 * Safari+VoiceOver won't announce the list otherwise.
			 */
			/* eslint-disable jsx-a11y/no-redundant-roles */
			<ul role="list" className="editor-block-types-list">
				{ items.map( ( item ) => {
					const itemIconStyle = item.icon ? {
						backgroundColor: item.icon.background,
						color: item.icon.foreground,
					} : {};
					const itemIconStackStyle = item.icon && item.icon.shadowColor ? {
						backgroundColor: item.icon.shadowColor,
					} : {};
					return (
						<li className="editor-block-types-list__list-item" key={ item.id }>
							<button
								className={
									classnames(
										'editor-block-types-list__item',
										getBlockMenuDefaultClassName( item.id ),
										{
											'editor-block-types-list__item-has-children': item.hasChildBlocks,
										}
									)
								}
								onClick={ () => {
									onSelect( item );
									onHover( null );
								} }
								disabled={ item.isDisabled }
								onMouseEnter={ () => onHover( item ) }
								onMouseLeave={ () => onHover( null ) }
								onFocus={ () => onHover( item ) }
								onBlur={ () => onHover( null ) }
								aria-label={ item.title } // Fix for IE11 and JAWS 2018.
							>
								<span
									className="editor-block-types-list__item-icon"
									style={ itemIconStyle }
								>
									<BlockIcon icon={ item.icon && item.icon.src } />
									{ item.hasChildBlocks &&
									<span
										className="editor-block-types-list__item-icon-stack"
										style={ itemIconStackStyle }
									/>
									}
								</span>

								<span className="editor-block-types-list__item-title">
									{ item.title }
								</span>
							</button>
						</li>
					);
				} ) }
			</ul>
			/* eslint-enable jsx-a11y/no-redundant-roles */
		);
	}
}

export default BlockTypesList;

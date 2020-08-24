/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { map, noop, reverse, sortBy } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EllipsisMenu from 'components/ellipsis-menu';
import PopoverMenuItem from 'components/popover/menu-item';
import SortableList from 'components/forms/sortable-list';
import EditorMediaModalGalleryEditItem from './edit-item';

class EditorMediaModalGalleryEdit extends React.Component {
	static propTypes = {
		site: PropTypes.object,
		settings: PropTypes.object,
		onUpdateSetting: PropTypes.func,
	};

	static defaultProps = {
		settings: Object.freeze( {} ),
		onUpdateSetting: noop,
	};

	onOrderChanged = ( order ) => {
		const items = [];

		this.props.settings.items.forEach( ( item, i ) => {
			items[ order[ i ] ] = item;
		} );

		this.props.onUpdateSetting( {
			items: items,
			orderBy: null,
		} );
	};

	render() {
		const { onUpdateSetting, site, settings, translate } = this.props;

		if ( ! site || ! settings.items ) {
			return null;
		}

		const orders = {
			[ translate( 'Reverse order' ) ]: reverse( [ ...settings.items ] ),
			[ translate( 'Order alphabetically' ) ]: sortBy( settings.items, 'title' ),
			[ translate( 'Order chronologically' ) ]: sortBy( settings.items, 'date' ),
		};

		return (
			<div>
				<EllipsisMenu popoverClassName="gallery__order-popover" position="bottom right">
					{ map( orders, ( orderedItems, name ) => {
						const boundAction = () => onUpdateSetting( { items: orderedItems } );
						return (
							<PopoverMenuItem key={ name } onClick={ boundAction }>
								{ name }
							</PopoverMenuItem>
						);
					} ) }
				</EllipsisMenu>
				<SortableList onChange={ this.onOrderChanged }>
					{ settings.items.map( ( item ) => {
						return (
							<EditorMediaModalGalleryEditItem
								key={ item.ID }
								site={ site }
								item={ item }
								showRemoveButton={ settings.items.length > 1 }
							/>
						);
					} ) }
				</SortableList>
			</div>
		);
	}
}

export default localize( EditorMediaModalGalleryEdit );

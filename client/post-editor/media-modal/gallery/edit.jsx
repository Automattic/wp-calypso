/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import SortableList from 'components/forms/sortable-list';
import EditorMediaModalGalleryEditItem from './edit-item';

export default React.createClass( {
	displayName: 'EditorMediaModalGalleryEdit',

	propTypes: {
		site: React.PropTypes.object,
		settings: PropTypes.object,
		onUpdateSetting: PropTypes.func
	},

	getDefaultProps() {
		return {
			settings: Object.freeze( {} ),
			onUpdateSetting: noop
		};
	},

	onOrderChanged: function( order ) {
		var items = [];

		this.props.settings.items.forEach( ( item, i ) => {
			items[ order[ i ] ] = item;
		} );

		this.props.onUpdateSetting( {
			items: items,
			orderBy: null
		} );
	},

	render() {
		const { site, settings } = this.props;

		if ( ! site || ! settings.items ) {
			return null;
		}

		return (
			<SortableList onChange={ this.onOrderChanged }>
				{ settings.items.map( ( item ) => {
					return (
						<EditorMediaModalGalleryEditItem
							key={ item.ID }
							site={ site }
							item={ item } />
					);
				} ) }
			</SortableList>
		);
	}
} );

/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { bindAll } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import SelectDropdown from 'components/select-dropdown';

class MediaFolderDropdown extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			selectedFolder: '',
		};

		bindAll( this, [ 'handleOnSelect' ] );
	}

	handleOnSelect( option ) {
		if ( this.props.disabled ) return;

		const folder = option.value;
		this.setState( {
			selectedFolder: folder,
		} );
		this.props.onFolderChange( folder );
	}

	render() {
		const rootClassNames = classNames( this.props.className, {
			'media-library__folder-dropdown': true,
		} );

		const separator = null;

		const folderOptions = [
			{
				value: '',
				label: 'All Photos',
			},
			separator,
			{
				value: 'album-1',
				label: 'Album 1',
				count: 9,
			},
			{
				value: 'album-2',
				label: 'Album 2',
				count: 29,
			},
			{
				value: 'album-3',
				label: 'Album 3',
				count: 52,
			},
			{
				value: 'album-4',
				label: 'Album 4',
				count: 18,
			},
		];

		return (
			<div className={ rootClassNames }>
				<SelectDropdown
					disabled={ this.props.disabled }
					compact={ true }
					onSelect={ this.handleOnSelect }
					options={ folderOptions }
				/>
			</div>
		);
	}
}

export default MediaFolderDropdown;

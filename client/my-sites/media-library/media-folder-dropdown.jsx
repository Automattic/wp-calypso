/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { bindAll } from 'lodash';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
/**
 * Internal dependencies
 */
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';

export class MediaFolderDropdown extends Component {
	static propTypes = {
		initialSelected: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ),
		folders: PropTypes.arrayOf(
			PropTypes.shape( {
				ID: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ).isRequired,
				URL: PropTypes.string,
				children: PropTypes.number.isRequired,
				date: PropTypes.string,
				file: PropTypes.string,
				name: PropTypes.string.isRequired,
				path: PropTypes.string.isRequired,
				thumbnails: PropTypes.object,
				type: PropTypes.string,
			} )
		),
		folder: PropTypes.string,
		onFolderChange: PropTypes.func,
		disabled: PropTypes.bool,
		compact: PropTypes.bool,
		defaultOption: PropTypes.shape( {
			ID: PropTypes.string,
			name: PropTypes.string,
		} ),
	};

	static defaultProps = {
		initialSelected: '/',
		folders: [],
		compact: true,
	};

	constructor( props ) {
		super( props );

		bindAll( this, [ 'handleOnSelect' ] );
	}

	handleOnSelect( event ) {
		if ( this.props.disabled ) return;

		const { value } = event.target;

		this.props.onFolderChange( value );
	}

	getDropDownOptions( folderData ) {
		let initial = [];

		if ( this.props.defaultOption ) {
			initial = [ this.props.defaultOption ];
		}

		return initial.concat( folderData );
	}

	renderOptions( optionData ) {
		return optionData.map( folder => {
			const folderId = '' + folder.ID;
			const folderChildren = folder.children ? ` (${ folder.children })` : '';

			const isSelected = folder.ID === this.props.folder ? 'selected' : '';

			return (
				<option value={ folderId } key={ folderId } selected={ isSelected }>
					{ folder.name }
					{ folderChildren }
				</option>
			);
		} );
	}

	render() {
		const rootClassNames = classNames( this.props.className, {
			'media-library__folder-dropdown': true,
		} );

		const folderOptions = this.getDropDownOptions( this.props.folders );

		// No need to show folders if we only have the default option
		if ( folderOptions.length <= 1 ) return null;

		return (
			<div className={ rootClassNames }>
				<FormLabel htmlFor="media-library-folders" className="media-library__folder-dropdown-label">
					Select Folder
				</FormLabel>
				<FormSelect
					id="media-library-folders"
					name="media-library-folders"
					value={ this.props.folder }
					className="media-library__folder-dropdown-field"
					onChange={ this.handleOnSelect }
					disabled={ this.props.disabled }
				>
					{ this.renderOptions( folderOptions ) }
				</FormSelect>
			</div>
		);
	}
}

export default localize( MediaFolderDropdown );

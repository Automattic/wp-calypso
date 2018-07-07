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
import SelectDropdown from 'components/select-dropdown';

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
		defaultOption: PropTypes.object,
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

	handleOnSelect( option ) {
		if ( this.props.disabled ) return;

		const folder = option.value;

		this.props.onFolderChange( folder );
	}

	getDropDownOptions( folderData ) {
		const separator = null;

		return [
			{
				value: '/',
				label: this.props.translate( 'All Albums' ),
			},
			separator,
		].concat(
			folderData.map( folder => {
				return {
					value: '' + folder.ID, // convert to string if number
					label: folder.name,
				};
			} )
		);
	}

	render() {
		const rootClassNames = classNames( this.props.className, {
			'media-library__folder-dropdown': true,
		} );

		const folderOptions = this.getDropDownOptions( this.props.folders );

		// No need to show folders if we only have the default option + seperator
		if ( folderOptions.length <= 2 ) return null;

		return (
			<div className={ rootClassNames }>
				<SelectDropdown
					initialSelected={ this.props.folder } // convert to string if number
					disabled={ this.props.disabled }
					compact={ this.props.compact }
					onSelect={ this.handleOnSelect }
					options={ folderOptions }
				/>
			</div>
		);
	}
}

export default localize( MediaFolderDropdown );

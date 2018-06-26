/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { bindAll } from 'lodash';
import classNames from 'classnames';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import SelectDropdown from 'components/select-dropdown';

class MediaFolderDropdown extends Component {
	static propTypes = {
		initialSelected: PropTypes.string,
		folders: PropTypes.array,
	};

	static defaultProps = {
		initialSelected: '__all__',
		folders: [],
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
				value: '__all__',
				label: 'All Photos',
			},
			separator,
		].concat( folderData );
	}

	render() {
		const rootClassNames = classNames( this.props.className, {
			'media-library__folder-dropdown': true,
		} );

		const folderOptions = this.getDropDownOptions( this.props.folders );

		// No need to show folders if we only have the default option
		if ( folderOptions.length <= 1 ) return;

		return (
			<div className={ rootClassNames }>
				<SelectDropdown
					initialSelected={ this.props.initialSelected }
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

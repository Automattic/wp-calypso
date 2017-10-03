/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import createFragment from 'react-addons-create-fragment';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import MediaUtils from 'lib/media/utils';

class EditorMediaModalDetailFileInfo extends Component {

	static propTypes = {
		item: PropTypes.object
	};

	getItemValue( attribute ) {
		const { moment, translate } = this.props;
		let value;

		if ( ! this.props.item ) {
			return translate( 'Loading…' );
		}

		switch ( attribute ) {
			case 'extension':
				value = ( this.props.item[ attribute ] || '' ).toUpperCase();
				break;

			case 'dimensions':
				value = createFragment( {
					width: <abbr title={ translate( 'Width in pixels' ) }>{ this.props.item.width }</abbr>,
					separator: ' ✕ ',
					height: <abbr title={ translate( 'Height in pixels' ) }>{ this.props.item.height }</abbr>
				} );
				break;

			case 'date':
				value = moment( this.props.item[ attribute ] ).format( 'D MMMM YYYY' );
				break;

			case 'length':
				value = MediaUtils.playtime( this.props.item[ attribute ] );
				break;

			default:
				value = this.props.item[ attribute ];
		}

		return value;
	}

	renderDimensions() {
		const { translate } = this.props;

		if ( ! this.props.item || ( ! this.props.item.width && ! this.props.item.height ) ) {
			return;
		}

		return (
			<tr>
				<th>{ translate( 'Dimensions' ) }</th>
				<td>{ this.getItemValue( 'dimensions' ) }</td>
			</tr>
		);
	}

	renderDuration() {
		const { translate } = this.props;

		if ( ! this.props.item || ! this.props.item.length ) {
			return;
		}

		return (
			<tr>
				<th>{ translate( 'Duration' ) }</th>
				<td>{ this.getItemValue( 'length' ) }</td>
			</tr>
		);
	}

	render() {
		const { translate } = this.props;

		let classes = classNames( 'editor-media-modal-detail__file-info', {
			'is-loading': ! this.props.item
		} );

		return (
			<table className={ classes }>
				<tbody>
					<tr>
						<th>{ translate( 'File Name' ) }</th>
						<td title={ this.getItemValue( 'file' ) }>
							<span>{ this.getItemValue( 'file' ) }</span>
						</td>
					</tr>
					<tr>
						<th>{ translate( 'File Type' ) }</th>
						<td>{ this.getItemValue( 'extension' ) }</td>
					</tr>
					{ this.renderDimensions() }
					{ this.renderDuration() }
					<tr>
						<th>{ translate( 'Upload Date' ) }</th>
						<td>{ this.getItemValue( 'date' ) }</td>
					</tr>
				</tbody>
			</table>
		);
	}
}

EditorMediaModalDetailFileInfo.displayName = 'EditorMediaModalDetailFileInfo';

export default localize( EditorMediaModalDetailFileInfo );

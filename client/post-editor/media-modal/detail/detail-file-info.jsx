/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { playtime } from 'lib/media/utils';
import { withLocalizedMoment } from 'components/localized-moment';

class EditorMediaModalDetailFileInfo extends React.Component {
	static displayName = 'EditorMediaModalDetailFileInfo';

	static propTypes = {
		item: PropTypes.object,
	};

	getItemValue = ( attribute ) => {
		let value;

		if ( ! this.props.item ) {
			return this.props.translate( 'Loading…' );
		}

		switch ( attribute ) {
			case 'extension':
				value = ( this.props.item[ attribute ] || '' ).toUpperCase();
				break;

			case 'dimensions':
				value = [
					<abbr key="width" title={ this.props.translate( 'Width in pixels' ) }>
						{ this.props.item.width }
					</abbr>,
					' ✕ ',
					<abbr key="height" title={ this.props.translate( 'Height in pixels' ) }>
						{ this.props.item.height }
					</abbr>,
				];
				break;

			case 'date':
				value = this.props.moment( this.props.item[ attribute ] ).format( 'D MMMM YYYY' );
				break;

			case 'length':
				value = playtime( this.props.item[ attribute ] );
				break;

			default:
				value = this.props.item[ attribute ];
		}

		return value;
	};

	renderDimensions = () => {
		if ( ! this.props.item || ( ! this.props.item.width && ! this.props.item.height ) ) {
			return;
		}

		return (
			<tr>
				<th>{ this.props.translate( 'Dimensions' ) }</th>
				<td>{ this.getItemValue( 'dimensions' ) }</td>
			</tr>
		);
	};

	renderDuration = () => {
		if ( ! this.props.item || ! this.props.item.length ) {
			return;
		}

		return (
			<tr>
				<th>{ this.props.translate( 'Duration' ) }</th>
				<td>{ this.getItemValue( 'length' ) }</td>
			</tr>
		);
	};

	render() {
		const classes = classNames( 'editor-media-modal-detail__file-info', {
			'is-loading': ! this.props.item,
		} );

		return (
			<table className={ classes }>
				<tbody>
					<tr>
						<th>{ this.props.translate( 'File Name' ) }</th>
						<td title={ this.getItemValue( 'file' ) }>
							<span>{ this.getItemValue( 'file' ) }</span>
						</td>
					</tr>
					<tr>
						<th>{ this.props.translate( 'File Type' ) }</th>
						<td>{ this.getItemValue( 'extension' ) }</td>
					</tr>
					{ this.renderDimensions() }
					{ this.renderDuration() }
					<tr>
						<th>{ this.props.translate( 'Upload Date' ) }</th>
						<td>{ this.getItemValue( 'date' ) }</td>
					</tr>
				</tbody>
			</table>
		);
	}
}

export default localize( withLocalizedMoment( EditorMediaModalDetailFileInfo ) );

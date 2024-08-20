import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import { playtime } from 'calypso/lib/media/utils';

class EditorMediaModalDetailFileInfo extends Component {
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

	renderFileSize = () => {
		const fileSize = this.getItemValue( 'size' );

		if ( ! fileSize || fileSize === 0 || fileSize === '0.00 B' ) {
			return;
		}

		return (
			<tr>
				<th>{ this.props.translate( 'File Size' ) }</th>
				<td>{ fileSize }</td>
			</tr>
		);
	};

	renderUploadedTo = () => {
		const parentTitle = this.getItemValue( 'parent_title' );
		const parentLink = this.getItemValue( 'parent_link' );

		if ( ! parentTitle || ! parentLink ) {
			return;
		}

		return (
			<tr>
				<th>{ this.props.translate( 'Uploaded to' ) }</th>
				<td>
					<ExternalLink icon href={ parentLink }>
						{ parentTitle }
					</ExternalLink>
				</td>
			</tr>
		);
	};

	renderAttachedTo = () => {
		const attachedToDetails = this.getItemValue( 'attached_to' );

		if ( ! attachedToDetails ) {
			return;
		}

		return (
			<tr>
				<th>{ this.props.translate( 'Attached to' ) }</th>
				<td>
					<ul>
						{ attachedToDetails.map( ( item ) => (
							<li key={ item.url }>
								<ExternalLink icon href={ item.url }>
									{ [ item.title ] }
								</ExternalLink>
							</li>
						) ) }
					</ul>
				</td>
			</tr>
		);
	};

	render() {
		const classes = clsx( 'editor-media-modal-detail__file-info', {
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
					{ this.renderFileSize() }
					{ this.renderDimensions() }
					{ this.renderDuration() }
					<tr>
						<th>{ this.props.translate( 'Upload Date' ) }</th>
						<td>{ this.getItemValue( 'date' ) }</td>
					</tr>
					{ this.renderUploadedTo() }
					{ this.renderAttachedTo() }
				</tbody>
			</table>
		);
	}
}

export default localize( withLocalizedMoment( EditorMediaModalDetailFileInfo ) );

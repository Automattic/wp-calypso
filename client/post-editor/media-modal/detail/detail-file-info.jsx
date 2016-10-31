/**
 * External dependencies
 */
var React = require( 'react' ),
	createFragment = require( 'react-addons-create-fragment' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var MediaUtils = require( 'lib/media/utils' );

module.exports = React.createClass( {
	displayName: 'EditorMediaModalDetailFileInfo',

	propTypes: {
		item: React.PropTypes.object
	},

	getItemValue( attribute ) {
		let value;

		if ( ! this.props.item ) {
			return this.translate( 'Loading…' );
		}

		switch ( attribute ) {
			case 'extension':
				value = ( this.props.item[ attribute ] || '' ).toUpperCase();
				break;

			case 'dimensions':
				value = createFragment( {
					width: <abbr title={ this.translate( 'Width in pixels' ) }>{ this.props.item.width }</abbr>,
					separator: ' ✕ ',
					height: <abbr title={ this.translate( 'Height in pixels' ) }>{ this.props.item.height }</abbr>
				} );
				break;

			case 'date':
				value = this.moment( this.props.item[ attribute ] ).format( 'D MMMM YYYY' );
				break;

			case 'length':
				value = MediaUtils.playtime( this.props.item[ attribute ] );
				break;

			default:
				value = this.props.item[ attribute ];
		}

		return value;
	},

	renderDimensions() {
		if ( ! this.props.item || ( ! this.props.item.width && ! this.props.item.height ) ) {
			return;
		}

		return (
			<tr>
				<th>{ this.translate( 'Dimensions' ) }</th>
				<td>{ this.getItemValue( 'dimensions' ) }</td>
			</tr>
		);
	},

	renderDuration() {
		if ( ! this.props.item || ! this.props.item.length ) {
			return;
		}

		return (
			<tr>
				<th>{ this.translate( 'Duration' ) }</th>
				<td>{ this.getItemValue( 'length' ) }</td>
			</tr>
		);
	},

	render() {
		let classes = classNames( 'editor-media-modal-detail__file-info', {
			'is-loading': ! this.props.item
		} );

		return (
			<table className={ classes }>
				<tbody>
					<tr>
						<th>{ this.translate( 'File Name' ) }</th>
						<td title={ this.getItemValue( 'file' ) }>
							<span>{ this.getItemValue( 'file' ) }</span>
						</td>
					</tr>
					<tr>
						<th>{ this.translate( 'File Type' ) }</th>
						<td>{ this.getItemValue( 'extension' ) }</td>
					</tr>
					{ this.renderDimensions() }
					{ this.renderDuration() }
					<tr>
						<th>{ this.translate( 'Upload Date' ) }</th>
						<td>{ this.getItemValue( 'date' ) }</td>
					</tr>
				</tbody>
			</table>
		);
	}
} );

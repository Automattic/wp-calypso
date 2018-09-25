/** @format */

/**
 * External Dependencies
 */
import { Component } from '@wordpress/element';
import { select } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { TILE_MARGIN } from './constants';
import { rectangularLayout, squareLayout, circleLayout, columnsLayout } from './layouts';

class LayoutStyles extends Component {
	render() {
		const { className, columns, images, layout } = this.props;

		if ( ! images.length ) {
			return null;
		}

		const { getEditorSettings } = select( 'core/editor' );
		const editorSettings = getEditorSettings();
		const layoutOptions = {
			columns,
			maxWidth: editorSettings.maxWidth,
			images,
			margin: TILE_MARGIN,
		};
		let rows = [];

		switch ( layout ) {
			case 'square':
				rows = squareLayout( layoutOptions );
				break;
			case 'circle':
				rows = circleLayout( layoutOptions );
				break;
			case 'columns':
				rows = columnsLayout( layoutOptions );
				break;
			case 'rectangular':
			default:
				rows = rectangularLayout( layoutOptions );
		}

		let styles = '';
		let nth = 0;
		// Generated className might contain style classes (`is-style-*`)
		// This picks up the true wrapper class
		const wrapperClass = `.${ className.split( ' ' )[ 0 ] }`;

		// @TODO get rid of "rows"
		rows.forEach( row => {
			styles += row.images
				.map( image => {
					// Alternatively:
					// .${ className } img[data-id="${ image.id }"] {
					// .${ className } .blocks-gallery-item:nth-child(${ nth++ }) {
					// @TODO media-queries
					return `
					${ wrapperClass } .tiled-gallery__item-${ nth++ } {
						width: ${ image.width }px;
						height: ${ image.height }px;
					}
				`;
				} )
				.join( '' );
		} );

		// eslint-disable-next-line react/no-danger
		return <style dangerouslySetInnerHTML={ { __html: styles } } />;
	}
}

export default LayoutStyles;

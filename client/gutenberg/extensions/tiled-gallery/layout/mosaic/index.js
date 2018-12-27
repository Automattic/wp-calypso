/**
 * External dependencies
 */
import { Component, createRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import Column from '../column';
import Gallery from '../gallery';
import Row from '../row';
import { getGalleryRows, handleRowResize } from './resize';
import { imagesToRatios, ratiosToRows } from './ratios';

export default class Mosaic extends Component {
	gallery = createRef();
	pendingRaf = null;
	ro = null; // resizeObserver instance

	componentDidMount() {
		this.observeResize();
	}

	componentWillUnmount() {
		this.unobserveResize();
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.images !== this.props.images ) {
			this.triggerResize();
		}
	}

	handleGalleryResize = entries => {
		if ( this.pendingRaf ) {
			cancelAnimationFrame( this.pendingRaf );
			this.pendingRaf = null;
		}
		this.pendingRaf = requestAnimationFrame( () => {
			for ( const { contentRect, target } of entries ) {
				const { width } = contentRect;
				getGalleryRows( target ).forEach( row => handleRowResize( row, width ) );
			}
		} );
	};

	triggerResize() {
		if ( this.gallery.current ) {
			this.handleGalleryResize( [
				{
					target: this.gallery.current,
					contentRect: { width: this.gallery.current.clientWidth },
				},
			] );
		}
	}

	observeResize() {
		this.triggerResize();
		this.ro = new ResizeObserver( this.handleGalleryResize );
	}

	unobserveResize() {
		if ( this.ro ) {
			this.ro.disconnect();
			this.ro = null;
		}
		if ( this.pendingRaf ) {
			cancelAnimationFrame( this.pendingRaf );
			this.pendingRaf = null;
		}
	}

	render() {
		const { images, isWide, renderedImages } = this.props;
		const ratios = imagesToRatios( images );
		const rows = ratiosToRows( ratios, { isWide } );

		let cursor = 0;
		return (
			<Gallery galleryRef={ this.gallery }>
				{ rows.map( ( row, rowIndex ) => (
					<Row key={ rowIndex }>
						{ row.map( ( colSize, colIndex ) => {
							const columnImages = renderedImages.slice( cursor, cursor + colSize );
							cursor += colSize;
							return <Column key={ colIndex }>{ columnImages }</Column>;
						} ) }
					</Row>
				) ) }
			</Gallery>
		);
	}
}

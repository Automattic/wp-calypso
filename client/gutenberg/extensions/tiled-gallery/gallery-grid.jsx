/** @format */

/**
 * External dependencies
 */
import { Component, Fragment, createRef } from '@wordpress/element';
import classnames from 'classnames';
import ResizeObserver from 'resize-observer-polyfill';

/**
 * Internal dependencies
 */
import { DEFAULT_GALLERY_WIDTH } from './constants';
import { getLayout } from './layouts';

class TiledGalleryGrid extends Component {
	state = {
		width: DEFAULT_GALLERY_WIDTH,
	};

	// Create a ref to store the wrapper DOM element for ResizeObserver
	wrapper = createRef();

	pendingRaf = null;

	handleResize = entries => {
		if ( this.pendingRaf ) {
			cancelAnimationFrame( this.pendingRaf );
		}
		this.pendingRaf = requestAnimationFrame( () => {
			this.pendingRaf = null;
			for ( const entry of entries ) {
				const { width } = entry.contentRect;
				if ( width && width !== this.state.width ) {
					this.setWidth( width );
				}
			}
		} );
	};

	setWidth( width ) {
		this.setState( { width } );
	}

	componentDidMount() {
		if ( ! this.props.noResize ) {
			if ( this.wrapper.current ) {
				this.handleResize( [ this.wrapper.current.parentNode ] );
			}
			this.observer = new ResizeObserver( this.handleResize );
			this.observer.observe( this.wrapper.current.parentNode );
		}
	}

	componentWillUnmount() {
		if ( this.observer ) {
			this.observer.disconnect();
		}
		clearTimeout( this.deferredMount );
	}

	render() {
		const {
			align,
			children,
			className,
			columns,
			imageCrop,
			images,
			layout,
			noResize,
			renderGalleryImage,
		} = this.props;
		const { width } = this.state;
		const rows = getLayout( {
			columns,
			images,
			layout,
			contentWidth: width,
		} );
		let imageIndex = 0;

		console.group( 'single render' );
		console.log( 'Images: %o', images );
		console.log( 'Rows: %o', rows );

		const res = (
			<div
				className={ classnames( 'wp-block-jetpack-tiled-gallery', className, {
					'is-cropped': imageCrop,
					[ `align${ align }` ]: align,
					[ `columns-${ columns }` ]: columns,
				} ) }
				data-columns={ columns }
				ref={ this.wrapper }
				style={ { width } }
			>
				<Fragment>
					{ rows.map( ( row, rowIndex ) => {
						console.log( 'Row %o: %o', rowIndex, row );
						return (
							<div
								key={ rowIndex }
								className="tiled-gallery__row"
								style={
									noResize
										? undefined
										: {
												width: row.width,
												height: row.height,
										  }
								}
							>
								{ 'groups' in row
									? row.groups.map( ( group, groupI ) => {
											console.log( 'group: %o', group );
											return (
												<div key={ groupI } className="tiled-gallery__group">
													{ group.images.map( ( image, imgI ) => {
														console.log( image );
														console.log( 'Image: %o', images[ imageIndex ] );

														const galleryItem = (
															<div
																className="tiled-gallery__item"
																key={ imgI }
																style={
																	noResize
																		? undefined
																		: {
																				width: image.width,
																				height: image.height,
																		  }
																}
															>
																{ renderGalleryImage( imageIndex ) }
															</div>
														);

														imageIndex++;

														return galleryItem;
													} ) }
												</div>
											);
									  } )
									: row.tiles.map( tile => {
											console.log( tile );
											console.log( 'Image: %o', images[ imageIndex ] );

											const galleryItem = (
												<div
													className="tiled-gallery__item"
													key={ images[ imageIndex ].id || images[ imageIndex ].url }
													style={
														noResize
															? undefined
															: {
																	width: tile.width,
																	height: tile.height,
															  }
													}
												>
													{ renderGalleryImage( imageIndex ) }
												</div>
											);

											imageIndex++;

											return galleryItem;
									  } ) }
							</div>
						);
					} ) }
					{ children ? (
						<div
							key="tiled-gallery-row-extras"
							className="tiled-gallery__row tiled-gallery__row-extras"
						>
							{ children }
						</div>
					) : null }
				</Fragment>
			</div>
		);
		console.groupEnd();
		return res;
	}
}

export default TiledGalleryGrid;

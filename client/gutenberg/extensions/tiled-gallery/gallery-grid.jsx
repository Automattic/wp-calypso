/** @format */

/**
 * External dependencies
 */
import { Component, createRef } from '@wordpress/element';
import classnames from 'classnames';
import { defer } from 'lodash';
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

	handleResize = this.props.noResize
		? () => {}
		: entries => {
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
			this.deferredMount = defer( () => {
				// ResizeObserver has checks for `window` & `document`:
				// it does nothing if those are not available.
				this.observer = new ResizeObserver( this.handleResize );
				this.observer.observe( this.wrapper.current.parentNode );
			} );
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
			tileCount: images.length,
			width,
		} );
		let imageIndex = 0;

		return (
			<div
				className={ classnames( className, {
					'is-cropped': imageCrop,
					[ `align${ align }` ]: align,
					[ `columns-${ columns }` ]: columns,
				} ) }
				data-columns={ columns }
				ref={ this.wrapper }
				style={ noResize ? undefined : { width } }
			>
				{ rows.map( ( row, rowIndex ) => {
					return (
						<div
							key={ `tiled-gallery-row-${ rowIndex }` }
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
								? row.groups.map( ( group, groupI ) => (
										<div
											key={ groupI }
											className="tiled-gallery__group"
											style={
												noResize
													? undefined
													: {
															width: group.width,
															height: group.height,
													  }
											}
										>
											{ group.images.map( image => {
												const galleryItem = (
													<div
														className="tiled-gallery__item"
														key={ images[ imageIndex ].id || images[ imageIndex ].url }
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
								  ) )
								: row.tiles.map( tile => {
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
			</div>
		);
	}
}

export default TiledGalleryGrid;

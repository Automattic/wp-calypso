export default function Gallery( { children, galleryRef } ) {
	return (
		<div className="tiled-gallery__gallery" ref={ galleryRef }>
			{ children }
		</div>
	);
}

export class Jetpack_Tiled_Gallery_Group {
	constructor( images ) {
		this.images = images;
		this.ratio = this.get_ratio();
	}

	get_ratio = () => {
		let ratio = 0;
		for ( const image of this.images ) {
			if ( image.ratio ) {
				ratio += 1 / image.ratio;
			}
		}

		if ( ! ratio ) {
			return 1;
		}

		return 1 / ratio;
	};
}

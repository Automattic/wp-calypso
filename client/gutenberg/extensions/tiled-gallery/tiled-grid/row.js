export class Jetpack_Tiled_Gallery_Row {
	constructor( columns ) {
		this.columns = columns;
		this.ratio = this.get_ratio();
		this.weighted_ratio = this.get_weighted_ratio();
	}

	get_ratio = () => {
		let ratio = 0;
		for ( const column of this.columns ) {
			ratio += column.ratio;
		}
		return ratio > 0 ? ratio : 1;
	};

	get_weighted_ratio = () => {
		let weighted_ratio = 0;
		for ( const column of this.columns ) {
			weighted_ratio += column.ratio * column.images.length;
		}
		return weighted_ratio > 0 ? weighted_ratio : 1;
	};
}

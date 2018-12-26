export class Jetpack_Tiled_Gallery_Row {
	constructor( groups ) {
		this.groups = groups;
		this.ratio = this.get_ratio();
		this.weighted_ratio = this.get_weighted_ratio();
	}

	get_ratio = () => {
		let ratio = 0;
		for ( const group of this.groups ) {
			ratio += group.ratio;
		}
		return ratio > 0 ? ratio : 1;
	};

	get_weighted_ratio = () => {
		let weighted_ratio = 0;
		for ( const group of this.groups ) {
			weighted_ratio += group.ratio * group.images.length;
		}
		return weighted_ratio > 0 ? weighted_ratio : 1;
	};
}

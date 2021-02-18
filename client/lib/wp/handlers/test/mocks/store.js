let storeData = {};

export default {
	get( key ) {
		return storeData[ key ];
	},

	set( key, value ) {
		storeData[ key ] = value;
	},

	remove( key ) {
		delete storeData[ key ];
	},

	clear() {
		storeData = {};
	},
};

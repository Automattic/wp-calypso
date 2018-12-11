/** @format */
/**
 * Internal dependencies
 */
import { find, get, findIndex } from 'lodash';

const replaceAtIndex = ( array, index, item ) => {
	const newArray = array.slice();
	newArray.splice( index, 1, item );

	return newArray;
};

const toggleInStream = ( streamName, stream, setting ) => ( {
	[ streamName ]: {
		...stream,
		[ setting ]: ! get( stream, setting ),
	},
} );

const toggleInDevice = ( devices, deviceId, setting ) => {
	const device = find( devices, { device_id: parseInt( deviceId, 10 ) } );
	const deviceIndex = findIndex( devices, device );
	const deviceSetting = get( device, setting );

	return {
		devices: replaceAtIndex( devices, deviceIndex, {
			...device,
			[ setting ]: ! deviceSetting,
		} ),
	};
};

export default {
	wpcom( state, source, stream, setting ) {
		return toggleInStream( 'wpcom', get( state, 'dirty.wpcom' ), setting );
	},

	other( state, source, stream, setting ) {
		const devices = get( state, 'dirty.other.devices' );

		return {
			other: {
				...get( state, 'dirty.other' ),
				...( isNaN( stream )
					? toggleInStream( stream, get( state, [ 'dirty', 'other', stream ] ), setting )
					: toggleInDevice( devices, stream, setting ) ),
			},
		};
	},

	blog( state, source, stream, setting ) {
		const blogs = get( state, 'dirty.blogs' );
		const blog = find( blogs, { blog_id: parseInt( source, 10 ) } );
		const blogIndex = findIndex( blogs, blog );
		const devices = get( blog, 'devices', [] );

		return {
			blogs: replaceAtIndex( blogs, blogIndex, {
				...blog,
				...( isNaN( stream )
					? toggleInStream( stream, get( blog, stream ), setting )
					: toggleInDevice( devices, stream, setting ) ),
			} ),
		};
	},
};

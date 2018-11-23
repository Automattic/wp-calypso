/** @format */
/**
 * Internal dependencies
 */
import { find, get, without } from 'lodash';

const toggleInStream = ( streamName, stream, setting ) => ( {
	[ streamName ]: {
		...stream,
		[ setting ]: ! get( stream, setting ),
	},
} );

const toggleInDevice = ( devices, deviceId, setting ) => {
	const device = find( devices, ( { device_id } ) => device_id === parseInt( deviceId, 10 ) );
	const deviceSetting = get( device, setting );

	return {
		devices: [
			...without( devices, device ),
			{
				...device,
				[ setting ]: ! deviceSetting,
			},
		],
	};
};

export default {
	wpcom( state, source, stream, setting ) {
		return toggleInStream( 'wpcom', get( state, 'settings.dirty.wpcom' ), setting );
	},

	other( state, source, stream, setting ) {
		const devices = get( state, 'settings.dirty.other.devices' );

		return {
			other: {
				...get( state, 'settings.dirty.other' ),
				...( isNaN( stream )
					? toggleInStream(
							stream,
							get( state, [ 'settings', 'dirty', 'other', stream ] ),
							setting
					  )
					: toggleInDevice( devices, stream, setting ) ),
			},
		};
	},

	blog( state, source, stream, setting ) {
		const blogs = get( state, 'settings.dirty.blogs' );
		const blog = find( blogs, ( { blog_id } ) => blog_id === parseInt( source, 10 ) );
		const devices = get( blog, 'devices', [] );

		return {
			blogs: [
				...without( blogs, blog ),
				{
					...blog,
					...( isNaN( stream )
						? toggleInStream( stream, get( blog, stream ), setting )
						: toggleInDevice( devices, stream, setting ) ),
				},
			],
		};
	},
};

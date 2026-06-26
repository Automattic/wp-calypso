import { get } from 'lodash';

const replaceAtIndex = ( array, index, newItem ) =>
	array.map( ( item, idx ) => ( idx === index ? newItem : item ) );

const replaceOrAppend = ( array, originalItem, newItem ) =>
	array.includes( originalItem )
		? replaceAtIndex( array, array.indexOf( originalItem ), newItem )
		: [ ...array, newItem ];

const toggleInStream = ( streamName, stream, setting ) => ( {
	[ streamName ]: {
		...stream,
		[ setting ]: ! stream?.[ setting ],
	},
} );

const toggleInDevice = ( devices, deviceId, setting ) => {
	const device = devices?.find( ( item ) => item.device_id === parseInt( deviceId, 10 ) );
	const deviceSetting = device?.[ setting ];

	return {
		devices: replaceOrAppend( devices, device, {
			...device,
			[ setting ]: ! deviceSetting,
		} ),
	};
};

export default {
	wpcom( state, source, stream, setting ) {
		return toggleInStream( 'wpcom', state?.dirty?.wpcom, setting );
	},

	other( state, source, stream, setting ) {
		const devices = state?.dirty?.other?.devices;

		return {
			other: {
				...state?.dirty?.other,
				...( isNaN( stream )
					? toggleInStream( stream, state?.dirty?.other?.[ stream ], setting )
					: toggleInDevice( devices, stream, setting ) ),
			},
		};
	},

	blog( state, source, stream, setting ) {
		const blogs = state?.dirty?.blogs;
		const blog = blogs?.find( ( item ) => item.blog_id === parseInt( source, 10 ) );
		const devices = get( blog, 'devices', [] );

		return {
			blogs: replaceOrAppend( blogs, blog, {
				...blog,
				...( isNaN( stream )
					? toggleInStream( stream, blog?.[ stream ], setting )
					: toggleInDevice( devices, stream, setting ) ),
			} ),
		};
	},
};

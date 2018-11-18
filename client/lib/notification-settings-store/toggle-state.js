/** @format */
/**
 * Internal dependencies
 */
import { find, get, without } from 'lodash';

const toggleWpcom = ( state, source, stream, setting ) => ( {
	...state,
	settings: {
		...get( state, 'settings' ),
		dirty: {
			...get( state, 'settings.dirty' ),
			wpcom: {
				...get( state, 'settings.dirty.wpcom' ),
				[ setting ]: ! get( state, [ 'settings', 'dirty', 'wpcom', setting ] ),
			},
		},
	},
} );

const toggleOther = ( state, source, stream, setting ) => {
	if ( isNaN( stream ) ) {
		return {
			...state,
			settings: {
				...get( state, 'settings' ),
				dirty: {
					...get( state, 'settings.dirty' ),
					other: {
						...get( state, 'settings.dirty.other' ),
						[ stream ]: {
							...get( state, [ 'settings', 'dirty', 'other', stream ] ),
							[ setting ]: ! get( state, [ 'settings', 'dirty', 'other', stream, setting ] ),
						},
					},
				},
			},
		};
	}

	const devices = get( state, 'settings.dirty.other.devices' );
	const device = find( devices, ( { device_id } ) => device_id === parseInt( stream, 10 ) );
	const deviceSetting = get( device, setting );

	return {
		...state,
		settings: {
			...get( state, 'settings' ),
			dirty: {
				...get( state, 'settings.dirty' ),
				other: {
					...get( state, 'settings.dirty.other' ),
					devices: [
						...without( devices, device ),
						{
							...device,
							[ setting ]: ! deviceSetting,
						},
					],
				},
			},
		},
	};
};

const toggleBlog = ( state, source, stream, setting ) => {
	const blogs = get( state, 'settings.dirty.blogs' );
	const blog = find( blogs, ( { blog_id } ) => blog_id === parseInt( source, 10 ) );

	if ( isNaN( stream ) ) {
		return {
			...state,
			settings: {
				...state.settings,
				dirty: {
					...get( state, 'settings.dirty' ),
					blogs: [
						...without( blogs, blog ),
						{
							...blog,
							[ stream ]: {
								...get( blog, stream ),
								[ setting ]: ! get( blog, [ stream, setting ] ),
							},
						},
					],
				},
			},
		};
	}

	const devices = get( blog, 'devices', [] );
	const device = find( devices, ( { device_id } ) => device_id === parseInt( stream, 10 ) );
	const deviceSetting = get( device, setting );

	return {
		...state,
		settings: {
			...state.settings,
			dirty: {
				...state.settings.dirty,
				blogs: [
					...without( blogs, blog ),
					{
						...blog,
						devices: [
							...without( devices, device ),
							{
								...device,
								[ setting ]: ! deviceSetting,
							},
						],
					},
				],
			},
		},
	};
};

export default {
	wpcom( state, source, stream, setting ) {
		return toggleWpcom( state, source, stream, setting );
	},

	other( state, source, stream, setting ) {
		return toggleOther( state, source, stream, setting );
	},

	blog( state, source, stream, setting ) {
		return toggleBlog( state, source, stream, setting );
	},
};

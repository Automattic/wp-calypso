/** @format */
export default {
	wpcom( state, source, stream, setting ) {
		return state.updateIn( [ 'settings', 'dirty', 'wpcom', setting ], value => ! value );
	},

	other( state, source, stream, setting ) {
		if ( isNaN( stream ) ) {
			return state.updateIn( [ 'settings', 'dirty', 'other', stream, setting ], value => ! value );
		}

		return state.updateIn( [ 'settings', 'dirty', 'other', 'devices' ], devices => {
			const deviceIndex = state
				.getIn( [ 'settings', 'dirty', 'other', 'devices' ] )
				.findIndex( device => device.get( 'device_id' ) === parseInt( stream, 10 ) );

			return devices.update( deviceIndex, device => device.update( setting, value => ! value ) );
		} );
	},

	blog( state, source, stream, setting ) {
		const blogIndex = state
			.getIn( [ 'settings', 'dirty', 'blogs' ] )
			.findIndex( blog => blog.get( 'blog_id' ) === parseInt( source, 10 ) );

		if ( isNaN( stream ) ) {
			return state.updateIn( [ 'settings', 'dirty', 'blogs' ], blogs =>
				blogs.update( blogIndex, blog => blog.updateIn( [ stream, setting ], value => ! value ) )
			);
		}

		return state.updateIn( [ 'settings', 'dirty', 'blogs' ], blogs =>
			blogs.update( blogIndex, blog => {
				const deviceIndex = blog
					.get( 'devices' )
					.findIndex( device => device.get( 'device_id' ) === parseInt( stream, 10 ) );

				return blog.update( 'devices', devices =>
					devices.update( deviceIndex, device => device.update( setting, value => ! value ) )
				);
			} )
		);
	},
};

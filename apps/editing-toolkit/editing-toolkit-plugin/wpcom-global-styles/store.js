import { registerStore } from '@wordpress/data';

const DEFAULT_STATE = {
	isModalVisible: true,
};

registerStore( 'automattic/wpcom-global-styles', {
	reducer: ( state = DEFAULT_STATE, action ) => {
		switch ( action.type ) {
			case 'DISMISS_MODAL':
				return {
					...state,
					isModalVisible: false,
				};
		}

		return state;
	},

	actions: {
		dismissModal: () => ( {
			type: 'DISMISS_MODAL',
		} ),
	},

	selectors: {
		isModalVisible: ( state, currentSidebar, viewCanvasPath ) =>
			state.isModalVisible &&
			( currentSidebar === 'edit-site/global-styles' || viewCanvasPath === '/wp_global_styles' ),
	},

	persist: true,
} );

import { createRegistrySelector, registerStore } from '@wordpress/data';

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
		isModalVisible: createRegistrySelector( ( select ) => ( state ) => {
			const currentSidebar =
				select( 'core/interface' ).getActiveComplementaryArea( 'core/edit-site' );
			return currentSidebar === 'edit-site/global-styles' && state.isModalVisible;
		} ),
	},

	persist: true,
} );

import { useReducer } from 'react';

const JP_SUBSCRIPTION_BANNER_DISMISSED = 'jp_subscription_banner_dismissed';

export interface BannerDismissState {
	dismissed: boolean;
}

export interface BannerDismissAction {
	type: 'dismiss';
	payload?: boolean;
}

function reducer( state: BannerDismissState, action: BannerDismissAction ): BannerDismissState {
	switch ( action.type ) {
		case 'dismiss': {
			const dismissed = !! action.payload;
			sessionStorage.setItem( JP_SUBSCRIPTION_BANNER_DISMISSED, dismissed.toString() );

			return { dismissed };
		}
		default: {
			throw new Error();
		}
	}
}

export default function useBannerDismissReducer() {
	const initialState = {
		dismissed: sessionStorage.getItem( JP_SUBSCRIPTION_BANNER_DISMISSED ) === 'true',
	};

	return useReducer( reducer, initialState );
}

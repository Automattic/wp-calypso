import { createNoticeAction, removeNoticeAction } from './actions';

export default function( dispatch ) {
	function createNotice( type, text, options ) {
		var action = createNoticeAction( type, text, options );

		if ( action.duration > 0 ) {
			setTimeout( () => {
				dispatch( removeNoticeAction( action.noticeId ) );
			}, action.duration );
		}

		dispatch( action );
	}

	return {
		successNotice: ( text, options ) => {
			createNotice( 'is-success', text, options );
		},
		errorNotice: ( text, options ) => {
			createNotice( 'is-error', text, options );
		},
		removeNotice: ( noticeId ) => {
			dispatch( removeNoticeAction( noticeId ) );
		}
	};
}

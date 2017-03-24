/**
 * Internal dependencies
 */
import {
	NPS_SURVEY_DIALOG_IS_SHOWING,
} from 'state/action-types';

/**
 * Internal dependencies
 */
import notices from 'notices';

export function showNpsSurveyNotice() {
	return ( dispatch ) => {
		const options = {
			button: 'Sure!',
			onClick: ( event, closeFn ) => {
				closeFn();
				dispatch( setNpsSurveyDialogShowing( true ) );
			}
		};

		// NOTE: It would be nice to move to dispatching the `createNotice` action,
		// but that currently doesn't support notices with `button` and `onClick`
		// options.
		notices.new( 'Let us know how we are doing...', options, 'is-info' );
	};
}

export function setNpsSurveyDialogShowing( isShowing ) {
	return {
		type: NPS_SURVEY_DIALOG_IS_SHOWING,
		isShowing,
	};
}

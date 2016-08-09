/**
 * External dependencies
 */
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import titleActions from 'lib/screen-title/actions';

const ANALYTICS_PAGE_TITLE = 'Reader';

export default {
	rememberedPosts() {
		titleActions.setTitle( i18n.translate( 'Remembered Posts ‹ Reader' ) );
	},

};

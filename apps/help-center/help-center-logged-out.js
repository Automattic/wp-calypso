import './config';
import './help-center.scss';
import loadHelpCenter from './async-help-center';

/**
 * Checks if the help center should be automatically to keep session continuity.
 * @returns {boolean} Whether the help center should be automatically loaded.
 */
function shouldAutoLoadHelpCenter() {
	try {
		const preferences = window.localStorage.getItem(
			'logged_out_help_center_preferences_help_center_open'
		);
		if ( preferences ) {
			return JSON.parse( preferences );
		}
		return false;
	} catch ( error ) {
		return false;
	}
}

window.addEventListener( 'DOMContentLoaded', () => {
	const shouldAutoLoad = shouldAutoLoadHelpCenter();
	if ( shouldAutoLoad ) {
		loadHelpCenter();
	}
} );

document.dispatchEvent( new Event( 'help-center-ready-to-load' ) );

export { loadHelpCenter };

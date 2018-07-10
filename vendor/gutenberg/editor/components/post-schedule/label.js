/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { dateI18n, getSettings } from '@wordpress/date';
import { withSelect } from '@wordpress/data';

function PostScheduleLabel( { date } ) {
	const settings = getSettings();
	return date ?
		dateI18n( settings.formats.datetime, date ) :
		__( 'Immediately' );
}

export default withSelect( ( select ) => {
	return {
		date: select( 'core/editor' ).getEditedPostAttribute( 'date' ),
	};
} )( PostScheduleLabel );

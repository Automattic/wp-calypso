/** @format */
/**
 * External Dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { replace } from 'lodash';

/**
 * WordPress Dependencies
 */
import { MenuItem } from '@wordpress/components';
import {
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
	withAnalytics,
	bumpStat,
} from 'state/analytics/actions';
import { setSelectedEditor } from 'state/selected-editor/actions';
import getCurrentRoute from 'state/selectors/get-current-route';
import { getSelectedSiteId } from 'state/ui/selectors';

export const OptOutMenuItem = ( { classicEditorRoute, optOut, siteId, translate } ) => {
	const switchToClassicEditor = () => {
		optOut( siteId, classicEditorRoute );
	};
	return (
		<MenuItem onClick={ switchToClassicEditor }>
			{ translate( 'Switch to Classic Editor' ) }
		</MenuItem>
	);
};

const optOut = ( siteId, classicEditorRoute ) => {
	return withAnalytics(
		composeAnalytics(
			recordGoogleEvent(
				'Gutenberg Opt-Out',
				'Clicked "Switch to the classic editor" in the editor More menu.',
				'Opt-In',
				false
			),
			recordTracksEvent( 'calypso_gutenberg_opt_in', {
				opt_in: false,
			} ),
			bumpStat( 'gutenberg-opt-in', 'Calypso More Menu Opt Out' )
		),
		setSelectedEditor( siteId, 'classic', classicEditorRoute )
	);
};

export default connect(
	state => ( {
		classicEditorRoute: `/${ replace(
			getCurrentRoute( state ),
			'/block-editor/',
			''
		) }?force=true`,
		siteId: getSelectedSiteId( state ),
	} ),
	{ optOut }
)( localize( OptOutMenuItem ) );

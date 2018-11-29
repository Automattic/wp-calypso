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
import { navigate } from 'state/ui/actions';
import { getSelectedSiteId } from 'state/ui/selectors';

export const OptOutMenuItem = ( {
	classicEditorRoute,
	navigate: redirect,
	optOut,
	siteId,
	translate,
} ) => {
	const switchToClassicEditor = () => {
		optOut( siteId );
		redirect( classicEditorRoute );
	};
	return (
		<MenuItem onClick={ switchToClassicEditor }>
			{ translate( 'Switch to Classic Editor' ) }
		</MenuItem>
	);
};

const optOut = siteId => {
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
		setSelectedEditor( siteId, 'classic' )
	);
};

export default connect(
	state => ( {
		classicEditorRoute: `/${ replace( getCurrentRoute( state ), '/gutenberg/', '' ) }?force=true`,
		siteId: getSelectedSiteId( state ),
	} ),
	{ navigate, optOut }
)( localize( OptOutMenuItem ) );

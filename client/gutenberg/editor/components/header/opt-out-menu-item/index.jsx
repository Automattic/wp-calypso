/** @format */
/**
 * External Dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { replace } from 'lodash';

/**
 * WordPress Dependencies
 */
import { MenuItem } from '@wordpress/components';
import { compose } from '@wordpress/compose';
import { withSelect, withDispatch } from '@wordpress/data';

/**
 * Internal Dependencies
 */
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

export class OptOutMenuItem extends Component {
	switchToClassicEditor = () => {
		const { autosave, classicEditorRoute, isDraft, optOut, savePost, siteId } = this.props;
		if ( isDraft ) {
			savePost( { isPreview: true } );
		} else {
			autosave( { isPreview: true } );
		}
		optOut( siteId, classicEditorRoute );
	};

	render() {
		const { translate } = this.props;
		return (
			<MenuItem onClick={ this.switchToClassicEditor }>
				{ translate( 'Switch to Classic Editor' ) }
			</MenuItem>
		);
	}
}

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

export default compose( [
	withSelect( select => ( {
		isDraft:
			[ 'draft', 'auto-draft' ].indexOf(
				select( 'core/editor' ).getEditedPostAttribute( 'status' )
			) !== -1,
		isSaving: select( 'core/editor' ).isSavingPost(),
	} ) ),
	withDispatch( dispatch => ( {
		autosave: dispatch( 'core/editor' ).autosave,
		savePost: dispatch( 'core/editor' ).savePost,
	} ) ),
] )(
	connect(
		state => ( {
			classicEditorRoute: `/${ replace(
				getCurrentRoute( state ),
				'/block-editor/',
				''
			) }?force=true`,
			siteId: getSelectedSiteId( state ),
		} ),
		{ optOut }
	)( localize( OptOutMenuItem ) )
);

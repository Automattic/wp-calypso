/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { preventWidows } from 'lib/formatting';
import { getSelectedSiteId } from 'state/ui/selectors';
import Task from '../task';

import { setSelectedEditor } from 'state/selected-editor/actions';
import {
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
	withAnalytics,
	bumpStat,
} from 'state/analytics/actions';
import getGutenbergEditorUrl from 'state/selectors/get-gutenberg-editor-url';
import blockEditorImage from 'assets/images/illustrations/block-editor-fade.svg';

const DeprecateEditor = ( { siteId, gutenbergUrl, optIn } ) => {
	const translate = useTranslate();
	const actionCallback = () => {
		optIn( siteId, gutenbergUrl );
	};
	return (
		<Task
			title={ translate( 'The Block Editor is coming' ) }
			description={ preventWidows(
				translate(
					'Try the Block Editor now before it is enabled for everyone on {{strong}}May 22{{/strong}}. {{a}}Read more{{/a}}',
					{
						components: {
							a: <a href="#link-yet-to-be-decided" />,
							strong: <strong />,
						},
					}
				)
			) }
			actionText={ translate( 'Try it now' ) }
			actionOnClick={ actionCallback }
			illustration={ blockEditorImage }
			badgeText={ translate( "What's new" ) }
			taskId="deprecate-editor"
			areSkipOptionsEnabled={ false }
			dismissable={ true }
		/>
	);
};

const optIn = ( siteId, gutenbergUrl ) => {
	return withAnalytics(
		composeAnalytics(
			recordGoogleEvent(
				'Gutenberg Opt-In',
				'Clicked "Switch to Block editor" in editor deprecation notice.',
				'Opt-In',
				true
			),
			recordTracksEvent( 'calypso_gutenberg_opt_in', {
				opt_in: true,
			} ),
			bumpStat( 'gutenberg-opt-in', 'Calypso Editor Deprecation Notice Opt In' )
		),
		setSelectedEditor( siteId, 'gutenberg', gutenbergUrl )
	);
};

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	return {
		siteId,
		gutenbergUrl: getGutenbergEditorUrl( state, siteId ),
	};
};

const mapDispatchToProps = {
	optIn,
};

export default connect( mapStateToProps, mapDispatchToProps )( DeprecateEditor );

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
import { TASK_EDITOR_DEPRECATION } from '../../constants';

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
import FormattedDate from 'components/formatted-date';
import { localizeUrl } from 'lib/i18n-utils';
import InlineSupportLink from 'components/inline-support-link';

const DeprecateEditor = ( { siteId, gutenbergUrl, optIn } ) => {
	const translate = useTranslate();
	const actionCallback = () => {
		optIn( siteId, gutenbergUrl );
	};
	return (
		<Task
			title={ translate( 'The new WordPress editor is coming.' ) }
			description={ preventWidows(
				translate(
					'Get a head start before we activate it for everyone on {{date/}}. {{support}}Read more{{/support}}.',
					{
						components: {
							date: (
								<strong>
									<FormattedDate date="2020-06-01" format="MMMM D" />
								</strong>
							),
							support: (
								<InlineSupportLink
									supportPostId={ 165338 }
									supportLink={ localizeUrl(
										'https://wordpress.com/support/block-editor-is-coming'
									) }
									showIcon={ false }
									tracksEvent="calypso_customer_home_editor_deprecate_support_page_view"
									statsGroup="calypso_customer_home"
									statsName="editor_deprecate_learn_more"
								/>
							),
						},
					}
				)
			) }
			actionText={ translate( 'Use the WordPress editor' ) }
			actionOnClick={ actionCallback }
			illustration={ blockEditorImage }
			badgeText={ translate( "What's new" ) }
			taskId={ TASK_EDITOR_DEPRECATION }
			enableSkipOptions={ false }
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

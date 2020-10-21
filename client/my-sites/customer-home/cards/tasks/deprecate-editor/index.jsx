/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { preventWidows } from 'calypso/lib/formatting';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';
import { TASK_EDITOR_DEPRECATION } from 'calypso/my-sites/customer-home/cards/constants';

import { setSelectedEditor } from 'calypso/state/selected-editor/actions';
import {
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
	withAnalytics,
	bumpStat,
} from 'calypso/state/analytics/actions';
import getGutenbergEditorUrl from 'calypso/state/selectors/get-gutenberg-editor-url';
import blockEditorImage from 'calypso/assets/images/illustrations/block-editor-fade.svg';
import FormattedDate from 'calypso/components/formatted-date';
import { localizeUrl } from 'calypso/lib/i18n-utils';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { useLocalizedMoment } from 'calypso/components/localized-moment';

const DeprecateEditor = ( { siteId, gutenbergUrl, optIn } ) => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const actionCallback = () => {
		optIn( siteId, gutenbergUrl );
	};
	const dateFormat = moment.localeData().longDateFormat( 'LL' );

	return (
		<Task
			title={ translate( 'The new WordPress editor is coming.' ) }
			description={ preventWidows(
				translate(
					'Get a head start before we activate it for everyone in the near future. {{support}}Read more{{/support}}.',
					{
						components: {
							date: (
								<strong>
									<FormattedDate date="2020-07-01" format={ dateFormat } />
								</strong>
							),
							support: (
								<InlineSupportLink
									supportPostId={ 167510 }
									supportLink={ localizeUrl(
										'https://wordpress.com/support/replacing-the-older-wordpress-com-editor-with-the-wordpress-block-editor/'
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

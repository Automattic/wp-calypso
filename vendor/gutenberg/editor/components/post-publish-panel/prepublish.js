/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Fragment } from '@wordpress/element';
import { PanelBody } from '@wordpress/components';
import { withSelect } from '@wordpress/data';

/**
 * Internal Dependencies
 */
import PostVisibility from '../post-visibility';
import PostVisibilityLabel from '../post-visibility/label';
import PostSchedule from '../post-schedule';
import PostScheduleLabel from '../post-schedule/label';

function PostPublishPanelPrepublish( {
	hasPublishAction,
	children,
} ) {
	return (
		<div className="editor-post-publish-panel__prepublish">
			<div><strong>{ hasPublishAction ? __( 'Are you ready to publish?' ) : __( 'Are you ready to submit for review?' ) }</strong></div>
			<p>{ hasPublishAction ? __( 'Here, you can do a last-minute check up of your settings below, before you publish.' ) : __( 'When you\'re ready, submit your work for review, and an Editor will be able to approve it for you.' ) }</p>
			{ hasPublishAction && (
				<Fragment>
					<PanelBody initialOpen={ false } title={ [
						__( 'Visibility:' ),
						<span className="editor-post-publish-panel__link" key="label"><PostVisibilityLabel /></span>,
					] }>
						<PostVisibility />
					</PanelBody>
					<PanelBody initialOpen={ false } title={ [
						__( 'Publish:' ),
						<span className="editor-post-publish-panel__link" key="label"><PostScheduleLabel /></span>,
					] }>
						<PostSchedule />
					</PanelBody>
					{ children }
				</Fragment>
			) }
		</div>
	);
}

export default withSelect(
	( select ) => {
		const { getCurrentPost } = select( 'core/editor' );
		return {
			hasPublishAction: get( getCurrentPost(), [ '_links', 'wp:action-publish' ], false ),
		};
	}
)( PostPublishPanelPrepublish );

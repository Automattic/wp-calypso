/**
 * External Dependencies
 */
import { get } from 'lodash';

/**
 * WordPress Dependencies
 */
import { Button } from '@wordpress/components';
import { compose } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { withSelect } from '@wordpress/data';
import { DotTip } from '@wordpress/nux';

/**
 * Internal Dependencies
 */
import PostPublishButton from '../post-publish-button';

export function PostPublishPanelToggle( {
	hasPublishAction,
	isSaving,
	isPublishable,
	isSaveable,
	isPublished,
	isBeingScheduled,
	isPending,
	isScheduled,
	onToggle,
	isOpen,
	forceIsDirty,
	forceIsSaving,
} ) {
	const isButtonEnabled = (
		! isSaving && ! forceIsSaving && isPublishable && isSaveable
	) || isPublished;

	const showToggle = ! isPublished && ! ( isScheduled && isBeingScheduled ) && ! ( isPending && ! hasPublishAction );

	if ( ! showToggle ) {
		return <PostPublishButton forceIsDirty={ forceIsDirty } forceIsSaving={ forceIsSaving } />;
	}

	return (
		<Button
			className="editor-post-publish-panel__toggle"
			isPrimary
			onClick={ onToggle }
			aria-expanded={ isOpen }
			disabled={ ! isButtonEnabled }
			isBusy={ isSaving && isPublished }
		>
			{ isBeingScheduled ? __( 'Schedule…' ) : __( 'Publish…' ) }
			<DotTip id="core/editor.publish">
				{ __( 'Finished writing? That’s great, let’s get this published right now. Just click ‘Publish’ and you’re good to go.' ) }
			</DotTip>
		</Button>
	);
}

export default compose( [
	withSelect( ( select ) => {
		const {
			isSavingPost,
			isEditedPostSaveable,
			isEditedPostPublishable,
			isCurrentPostPending,
			isCurrentPostPublished,
			isEditedPostBeingScheduled,
			isCurrentPostScheduled,
			getCurrentPost,
			getCurrentPostType,
		} = select( 'core/editor' );
		return {
			hasPublishAction: get( getCurrentPost(), [ '_links', 'wp:action-publish' ], false ),
			isSaving: isSavingPost(),
			isSaveable: isEditedPostSaveable(),
			isPublishable: isEditedPostPublishable(),
			isPending: isCurrentPostPending(),
			isPublished: isCurrentPostPublished(),
			isScheduled: isCurrentPostScheduled(),
			isBeingScheduled: isEditedPostBeingScheduled(),
			postType: getCurrentPostType(),
		};
	} ),
] )( PostPublishPanelToggle );

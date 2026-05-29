import { dispatch, select, subscribe, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { Icon, pending } from '@wordpress/icons';
import { getQueryArg } from '@wordpress/url';

// Hash that opts the editor into the Launchpad post-publish snackbar.
// - `#publish-first-post`: legacy hash, only the "publish first post" flow uses
//   it. Kept for backward compatibility; gates copy to "Well done publishing
//   your first post!" and only matches post type === 'post'.
// - `#launchpad-next-steps`: generic hash used by every other page-creating
//   Launchpad task (Gallery, Events, About, Contact, etc.). Matches any post
//   type and uses generic "Published!" copy.
const FIRST_POST_HASH = '#publish-first-post';
const GENERIC_LAUNCHPAD_HASH = '#launchpad-next-steps';

export function OnboardingNextStepAfterPublishingPost() {
	const currentPostType = useSelect(
		( localSelect ) => localSelect( 'core/editor' ).getCurrentPostType(),
		[]
	);

	const hash = window.location.hash;
	const isFirstPostFlow = hash === FIRST_POST_HASH && currentPostType === 'post';
	const isGenericLaunchpadFlow = hash === GENERIC_LAUNCHPAD_HASH;

	if ( ! isFirstPostFlow && ! isGenericLaunchpadFlow ) {
		return false;
	}

	// Save site origin in session storage to be used in editor refresh.
	const siteOriginParam = getQueryArg( window.location.search, 'origin' );
	if ( siteOriginParam ) {
		window.sessionStorage.setItem( 'site-origin', siteOriginParam );
	}

	const siteOrigin = window.sessionStorage.getItem( 'site-origin' ) || 'https://wordpress.com';
	const siteSlug = window.location.hostname;

	const successMessage = isFirstPostFlow
		? __( 'Well done publishing your first post!' )
		: __( 'Published! Back to your next steps.' );

	const unsubscribe = subscribe( () => {
		const isSavingPost = select( 'core/editor' ).isSavingPost();
		const getCurrentPostRevisionsCount = select( 'core/editor' ).getCurrentPostRevisionsCount();

		if ( isSavingPost ) {
			const unsubscribeFromSavingPost = subscribe( () => {
				const postStatus = select( 'core/editor' ).getEditedPostAttribute( 'status' );
				if (
					( postStatus === 'publish' || postStatus === 'future' ) &&
					getCurrentPostRevisionsCount >= 1
				) {
					unsubscribeFromSavingPost();
					unsubscribe();
					dispatch( 'core/edit-post' ).closePublishSidebar();

					const unsubscribeFromNotices = subscribe( () => {
						const notices = select( 'core/notices' ).getNotices();
						if ( notices.some( ( notice ) => notice.id === 'editor-save' ) ) {
							dispatch( 'core/notices' ).removeNotice( 'editor-save' );

							// Show success notice with Next steps link
							dispatch( 'core/notices' ).createSuccessNotice( successMessage, {
								actions: [
									{
										label: __( 'Next steps' ),
										url: `${ siteOrigin }/home/${ siteSlug }`,
									},
								],
								type: 'snackbar',
								isDismissible: true,
								explicitDismiss: true,
								icon: <Icon icon={ pending } fill="white" size={ 24 } />,
								id: 'NEXT_STEPS_NOTICE_ID',
							} );

							unsubscribeFromNotices();
						}
					} );
				}
			} );
		}
	} );
}

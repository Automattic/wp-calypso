import { dispatch, select, subscribe, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { Icon, pending } from '@wordpress/icons';
import { getQueryArg } from '@wordpress/url';

export function OnboardingNextStepAfterPublishingPost() {
	const currentPostType = useSelect(
		( localSelect ) => localSelect( 'core/editor' ).getCurrentPostType(),
		[]
	);

	const hasPublishFirstPostTaskQueryArg = window.location.hash === '#publish-first-post';

	if ( ! hasPublishFirstPostTaskQueryArg || currentPostType !== 'post' ) {
		return false;
	}

	// Save site origin in session storage to be used in editor refresh.
	const siteOriginParam = getQueryArg( window.location.search, 'origin' );
	if ( siteOriginParam ) {
		window.sessionStorage.setItem( 'site-origin', siteOriginParam );
	}

	const siteOrigin = window.sessionStorage.getItem( 'site-origin' ) || 'https://wordpress.com';
	const siteSlug = window.location.hostname;

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
							dispatch( 'core/notices' ).createSuccessNotice(
								__( 'Well done publishing your first post!' ),
								{
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
								}
							);

							unsubscribeFromNotices();
						}
					} );
				}
			} );
		}
	} );
}

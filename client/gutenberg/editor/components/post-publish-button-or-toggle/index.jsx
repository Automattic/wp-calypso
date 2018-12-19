/** @format */
/**
 * External Dependencies
 */
import React, { Component, Fragment } from 'react';
import { get } from 'lodash';
import { translate } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * WordPress dependencies.
 */
import { compose, withState } from '@wordpress/compose';
import { withDispatch, withSelect } from '@wordpress/data';
import { PostPublishButton } from '@wordpress/editor';
import { withViewportMatch } from '@wordpress/viewport';

/**
 * Internal dependencies
 */
import VerifyEmailDialog from 'components/email-verification/email-verification-dialog';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isCurrentUserEmailVerified } from 'state/current-user/selectors';
import isUnlaunchedSite from 'state/selectors/is-unlaunched-site';
import isVipSite from 'state/selectors/is-vip-site';

export class PostPublishButtonOrToggle extends Component {
	componentDidMount() {
		this.togglePostSaving();
	}

	componentDidUpdate( prevProps ) {
		const { userNeedsVerification, verificationNoticeLabel } = this.props;
		if (
			userNeedsVerification !== prevProps.userNeedsVerification ||
			verificationNoticeLabel !== prevProps.verificationNoticeLabel
		) {
			this.togglePostSaving();
		}
	}

	togglePostSaving() {
		const {
			userNeedsVerification,
			lockPostSaving,
			unlockPostSaving,
			createWarningNotice,
			setState,
			verificationNoticeLabel,
		} = this.props;

		const lockName = 'blockEditorPostSavingLock';

		if ( userNeedsVerification ) {
			lockPostSaving( lockName );

			createWarningNotice( verificationNoticeLabel, {
				id: 'verify-email-notice',
				isDismissible: false,
				actions: [
					{
						label: translate( 'Learn More' ),
						url: true, // This causes a warning because true is not a valid href attribute, but it is
						// needed in order to display the action button as a link
						onClick: () => setState( { showEmailVerificationNotice: true } ),
					},
				],
			} );
		} else {
			unlockPostSaving( lockName );
		}
	}

	closeVerifyEmailDialog = () => {
		this.props.setState( { showEmailVerificationNotice: false } );
	};

	render() {
		const {
			forceIsDirty,
			forceIsSaving,
			hasPublishAction,
			isBeingScheduled,
			isLessThanMediumViewport,
			isPending,
			isPublished,
			isPublishSidebarEnabled,
			isPublishSidebarOpened,
			isScheduled,
			togglePublishSidebar,
			showEmailVerificationNotice,
		} = this.props;

		const IS_TOGGLE = 'toggle';
		const IS_BUTTON = 'button';
		let component;

		/**
		 * Conditions to show a BUTTON (publish directly) or a TOGGLE (open publish sidebar):
		 *
		 * 1) We want to show a BUTTON when the post status is at the _final stage_
		 * for a particular role (see https://codex.wordpress.org/Post_Status):
		 *
		 * - is published
		 * - is scheduled to be published
		 * - is pending and can't be published (but only for viewports >= medium).
		 * 	 Originally, we considered showing a button for pending posts that couldn't be published
		 * 	 (for example, for an author with the contributor role). Some languages can have
		 * 	 long translations for "Submit for review", so given the lack of UI real estate available
		 * 	 we decided to take into account the viewport in that case.
		 *  	 See: https://github.com/WordPress/gutenberg/issues/10475
		 *
		 * 2) Then, in small viewports, we'll show a TOGGLE.
		 *
		 * 3) Finally, we'll use the publish sidebar status to decide:
		 *
		 * - if it is enabled, we show a TOGGLE
		 * - if it is disabled, we show a BUTTON
		 */
		if (
			isPublished ||
			( isScheduled && isBeingScheduled ) ||
			( isPending && ! hasPublishAction && ! isLessThanMediumViewport )
		) {
			component = IS_BUTTON;
		} else if ( isLessThanMediumViewport ) {
			component = IS_TOGGLE;
		} else if ( isPublishSidebarEnabled ) {
			component = IS_TOGGLE;
		} else {
			component = IS_BUTTON;
		}

		return (
			<Fragment>
				<PostPublishButton
					forceIsDirty={ forceIsDirty }
					forceIsSaving={ forceIsSaving }
					isOpen={ isPublishSidebarOpened }
					isToggle={ component === IS_TOGGLE }
					onToggle={ togglePublishSidebar }
				/>
				{ showEmailVerificationNotice && (
					<VerifyEmailDialog onClose={ this.closeVerifyEmailDialog } />
				) }
			</Fragment>
		);
	}
}

const applyWithSelect = withSelect( select => {
	const {
		getCurrentPost,
		isEditedPostBeingScheduled,
		isCurrentPostPending,
		isCurrentPostPublished,
		isPublishSidebarEnabled,
		isCurrentPostScheduled,
		isPostSavingLocked,
	} = select( 'core/editor' );

	const { isPublishSidebarOpened } = select( 'core/edit-post' );

	const isPublished = isCurrentPostPublished();
	const isBeingScheduled = isEditedPostBeingScheduled();

	let verificationNoticeLabel;
	if ( isPublished ) {
		verificationNoticeLabel = translate( 'To update, check your email and confirm your address.' );
	} else if ( isBeingScheduled ) {
		verificationNoticeLabel = translate(
			'To schedule, check your email and confirm your address.'
		);
	} else {
		verificationNoticeLabel = translate( 'To publish, check your email and confirm your address.' );
	}

	return {
		hasPublishAction: get( getCurrentPost(), [ '_links', 'wp:action-publish' ], false ),
		isBeingScheduled,
		isPending: isCurrentPostPending(),
		isPublished,
		isPublishSidebarEnabled: isPublishSidebarEnabled(),
		isPublishSidebarOpened: isPublishSidebarOpened(),
		isScheduled: isCurrentPostScheduled(),
		isPostSavingLocked: isPostSavingLocked(),
		verificationNoticeLabel,
	};
} );

const applyWithDispatch = withDispatch( dispatch => {
	const { togglePublishSidebar } = dispatch( 'core/edit-post' );
	const { createWarningNotice } = dispatch( 'core/notices' );
	const { lockPostSaving, unlockPostSaving } = dispatch( 'core/editor' );
	return {
		togglePublishSidebar,
		createWarningNotice,
		lockPostSaving,
		unlockPostSaving,
	};
} );

export default compose(
	applyWithSelect,
	applyWithDispatch,
	withViewportMatch( { isLessThanMediumViewport: '< medium' } ),
	withState( {
		showEmailVerificationNotice: false,
	} ),
	connect( state => {
		const siteId = getSelectedSiteId( state );

		// do not allow publish for unverified e-mails, but allow if the site is VIP, or if the site is unlaunched
		const userNeedsVerification =
			! isCurrentUserEmailVerified( state ) &&
			! isVipSite( state, siteId ) &&
			! isUnlaunchedSite( state, siteId );

		return {
			userNeedsVerification,
		};
	} )
)( PostPublishButtonOrToggle );

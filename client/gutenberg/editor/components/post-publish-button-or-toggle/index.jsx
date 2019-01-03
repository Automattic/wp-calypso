/** @format */
/**
 * External Dependencies
 */
import React, { Component, Fragment } from 'react';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * WordPress dependencies.
 */
import { compose } from '@wordpress/compose';
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
	state = {
		showEmailVerificationDialog: false,
	};

	componentDidMount() {
		this.toggleLockPostSaving();
	}

	componentDidUpdate( prevProps ) {
		const { userNeedsVerification, isPublished, isBeingScheduled } = this.props;
		if (
			userNeedsVerification !== prevProps.userNeedsVerification ||
			isPublished !== prevProps.isPublished ||
			isBeingScheduled !== prevProps.isBeingScheduled
		) {
			this.toggleLockPostSaving();
		}
	}

	/**
	 * Locks the post saving if the user needs to verify their email, or unlocks it otherwise.
	 */
	toggleLockPostSaving() {
		const {
			userNeedsVerification,
			lockPostSaving,
			unlockPostSaving,
			createWarningNotice,
			translate,
		} = this.props;

		const lockName = 'blockEditorPostSavingLock';

		if ( userNeedsVerification ) {
			lockPostSaving( lockName );

			createWarningNotice( this.getVerificationNoticeLabel(), {
				id: 'verify-email-notice',
				isDismissible: false,
				actions: [
					{
						label: translate( 'Learn More' ),
						url: '#',
						onClick: e => {
							e.preventDefault();
							this.setState( { showEmailVerificationDialog: true } );
						},
					},
				],
			} );
		} else {
			unlockPostSaving( lockName );
		}
	}

	/**
	 * Gets the label to be used in the verification notice which depends on the post status
	 * @returns {string} The verification notice label
	 */
	getVerificationNoticeLabel() {
		const { isPublished, isBeingScheduled, translate } = this.props;
		if ( isPublished ) {
			return translate( 'To update, check your email and confirm your address.' );
		} else if ( isBeingScheduled ) {
			return translate( 'To schedule, check your email and confirm your address.' );
		}
		return translate( 'To publish, check your email and confirm your address.' );
	}

	/**
	 * Closes the dialog explaining why we need to verify the email
	 */
	closeVerifyEmailDialog = () => {
		this.setState( { showEmailVerificationDialog: false } );
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
		} = this.props;

		const { showEmailVerificationDialog } = this.state;

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
				{ showEmailVerificationDialog && (
					<VerifyEmailDialog onClose={ this.closeVerifyEmailDialog } />
				) }
			</Fragment>
		);
	}
}

export default compose(
	withSelect( select => ( {
		hasPublishAction: get(
			select( 'core/editor' ).getCurrentPost(),
			[ '_links', 'wp:action-publish' ],
			false
		),
		isBeingScheduled: select( 'core/editor' ).isEditedPostBeingScheduled(),
		isPending: select( 'core/editor' ).isCurrentPostPending(),
		isPublished: select( 'core/editor' ).isCurrentPostPublished(),
		isPublishSidebarEnabled: select( 'core/editor' ).isPublishSidebarEnabled(),
		isPublishSidebarOpened: select( 'core/edit-post' ).isPublishSidebarOpened(),
		isScheduled: select( 'core/editor' ).isCurrentPostScheduled(),
	} ) ),
	withDispatch( dispatch => {
		const { togglePublishSidebar } = dispatch( 'core/edit-post' );
		const { createWarningNotice } = dispatch( 'core/notices' );
		const { lockPostSaving, unlockPostSaving } = dispatch( 'core/editor' );
		return {
			togglePublishSidebar,
			createWarningNotice,
			lockPostSaving,
			unlockPostSaving,
		};
	} ),
	withViewportMatch( { isLessThanMediumViewport: '< medium' } ),
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
)( localize( PostPublishButtonOrToggle ) );

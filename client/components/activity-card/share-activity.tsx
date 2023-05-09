import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useRef, useState } from 'react';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import Button from 'calypso/components/forms/form-button';
import FormTextInput from 'calypso/components/forms/form-text-input';
import PopoverMenu from 'calypso/components/popover-menu';
import { rewindShareRequest } from 'calypso/state/activity-log/actions';
import { recordTracksEvent, withAnalytics } from 'calypso/state/analytics/actions';
import type { Activity } from './types';

type OwnProps = {
	siteId: number;
	activity: Activity;
};

type SharePopoverProps = {
	siteId: number;
	activity: Activity;
	context: React.MutableRefObject< React.ReactElement | null >;
	isVisible: boolean;
	onClose: ( event?: boolean ) => void;
};

const SharePopover: React.FC< SharePopoverProps > = ( {
	siteId,
	activity,
	context,
	isVisible,
	onClose,
} ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const [ email, setEmail ] = useState( '' );
	const [ showEmailError, setShowEmailError ] = useState( false );

	const handleEmailChange: React.ChangeEventHandler< HTMLInputElement > = useCallback(
		( event ) => {
			setEmail( event.target.value );
			setShowEmailError( false );
		},
		[ setEmail, setShowEmailError ]
	);

	const closeOnClickOut = useCallback(
		( event?: boolean ) => {
			// HACK: Keep the pop-over open until
			// we've registered a click outside of it;
			// see onClickOut in `client/components/popover/index.jsx`
			if ( event !== false ) {
				return;
			}

			onClose();
		},
		[ onClose ]
	);

	const handleShare = useCallback( () => {
		if ( ! email.includes( '@' ) || ! email.includes( '.' ) ) {
			setShowEmailError( true );
		} else {
			dispatch(
				withAnalytics(
					recordTracksEvent( 'calypso_activity_share_request', {
						site_id: siteId,
						rewind_id: activity.rewindId,
					} ),
					rewindShareRequest( siteId, activity.rewindId as string, email )
				)
			);

			onClose();
		}
	}, [ email, dispatch, siteId, activity.rewindId, onClose ] );
	const shareOnEnterKeyPress: React.KeyboardEventHandler = useCallback(
		( { key } ) => {
			if ( key !== 'Enter' ) {
				return;
			}

			handleShare();
		},
		[ handleShare ]
	);

	return (
		<PopoverMenu
			context={ context.current }
			isVisible={ isVisible }
			onClose={ closeOnClickOut }
			position="top"
			className="activity-card__share-popover"
		>
			<div className="activity-card__share-heading">
				{ translate( 'Share this event via email' ) }
			</div>
			<div className="activity-card__share-description">
				{ translate(
					'Share what is happening with your site with your clients or business partners.'
				) }
			</div>
			<div className="activity-card__share-form">
				<FormTextInput
					className="activity-card__share-email"
					placeholder="Email address"
					value={ email }
					onChange={ handleEmailChange }
					isError={ showEmailError }
					onKeyPress={ shareOnEnterKeyPress }
				/>
				<Button
					className="activity-card__share-submit"
					disabled={ ! email }
					onClick={ handleShare }
				>
					{ translate( 'Share' ) }
				</Button>
			</div>
			{ showEmailError && (
				<div className="activity-card__share-error">
					{ translate( 'Please enter a valid email address' ) }
				</div>
			) }
		</PopoverMenu>
	);
};

const ShareActivity: React.FC< OwnProps > = ( { siteId, activity } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const buttonRef = useRef( null );

	const { rewindId } = activity;

	const [ isPopoverVisible, setPopoverVisible ] = useState( false );
	const trackPopoverOpened = useCallback(
		() =>
			dispatch(
				recordTracksEvent( 'calypso_activity_share_popup', {
					site_id: siteId,
					rewind_id: rewindId,
				} )
			),
		[ dispatch, siteId, rewindId ]
	);
	const togglePopover = () => {
		if ( ! isPopoverVisible ) {
			trackPopoverOpened();
		}

		setPopoverVisible( ! isPopoverVisible );
	};
	const closePopover = () => {
		setPopoverVisible( false );
	};

	return (
		<>
			<div className="activity-card__share-button-wrap">
				<Button
					compact
					borderless
					className="activity-card__share-button"
					ref={ buttonRef }
					onClick={ togglePopover }
				>
					<Gridicon icon="mail" />
					{ translate( 'Share this event' ) }
				</Button>
			</div>

			<SharePopover
				siteId={ siteId }
				context={ buttonRef }
				activity={ activity }
				isVisible={ isPopoverVisible }
				onClose={ closePopover }
			/>
		</>
	);
};

export default ShareActivity;

/**
 * External dependencies
 */
import React, { useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Button } from '@automattic/components';
import { isDesktop } from '@automattic/viewport';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Spinner from 'calypso/components/spinner';
import { skipViewHomeLayout } from 'calypso/state/home/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';
import { getHomeLayout } from 'calypso/state/selectors/get-home-layout';

/**
 * Image dependencies
 */
import fireworksIllustration from 'calypso/assets/images/customer-home/illustration--fireworks-v2.svg';

const CelebrateNotice = ( {
	actionText,
	description,
	noticeId,
	illustration = fireworksIllustration,
	onSkip,
	showSkip = false,
	skipText,
	siteId,
	title,
	tracksEventExtras = {},
	currentView,
} ) => {
	const [ isLoading, setIsLoading ] = useState( false );
	const [ isVisible, setIsVisible ] = useState( true );
	const dispatch = useDispatch();

	if ( ! isVisible ) {
		return null;
	}

	const dismissalPreferenceKey = `dismissible-card-${ noticeId }-${ siteId }`;

	const showNextTask = () => {
		setIsLoading( true );
		dispatch( skipViewHomeLayout( siteId, currentView ) );

		dispatch(
			composeAnalytics(
				recordTracksEvent( 'calypso_customer_home_notice_show_next', {
					notice: noticeId,
					...tracksEventExtras,
				} )
			)
		);
	};

	const skip = () => {
		setIsVisible( false );
		dispatch( savePreference( dismissalPreferenceKey, true ) );
		onSkip && onSkip();

		dispatch(
			composeAnalytics(
				recordTracksEvent( 'calypso_customer_home_notice_skip', {
					notice: noticeId,
					...tracksEventExtras,
				} )
			)
		);
	};

	return (
		<div className={ classnames( 'celebrate-notice', 'task', { 'is-loading': isLoading } ) }>
			{ isLoading && <Spinner /> }
			<div className="celebrate-notice__text task__text">
				<h2 className="celebrate-notice__title task__title">{ title }</h2>
				<p className="celebrate-notice__description task__description">{ description }</p>
				<div className="celebrate-notice__actions task__actions">
					<Button
						className="celebrate-notice__action task__action"
						primary
						onClick={ showNextTask }
					>
						{ actionText }
					</Button>

					{ showSkip && (
						<Button className="celebrate-notice__skip task__skip is-link" onClick={ skip }>
							{ skipText }
						</Button>
					) }
				</div>
			</div>
			{ isDesktop() && (
				<div className="celebrate-notice__illustration task__illustration">
					<img src={ illustration } alt="" />
				</div>
			) }
		</div>
	);
};

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	return {
		siteId,
		currentView: getHomeLayout( state, siteId )?.view_name,
	};
};

export default connect( mapStateToProps )( CelebrateNotice );

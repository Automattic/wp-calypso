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
import Spinner from 'components/spinner';
import { requestHomeLayout } from 'state/home/actions';
import { savePreference } from 'state/preferences/actions';
import { getSelectedSiteId } from 'state/ui/selectors';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Image dependencies
 */
import fireworksIllustration from 'assets/images/customer-home/illustration--fireworks-v2.svg';

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
} ) => {
	const [ isLoading, setIsLoading ] = useState( false );
	const [ isVisible, setIsVisible ] = useState( true );
	const dispatch = useDispatch();

	if ( ! isVisible ) {
		return null;
	}

	const dismissalPreferenceKey = `dismissible-card-home-notice-${ noticeId }-${ siteId }`;

	const showNextTask = () => {
		setIsLoading( true );
		dispatch( savePreference( dismissalPreferenceKey, true ) );
		dispatch( requestHomeLayout( siteId ) );
	};

	const skip = () => {
		setIsVisible( false );
		dispatch( savePreference( dismissalPreferenceKey, true ) );
		onSkip && onSkip();
	};

	return (
		<div className={ classnames( 'celebrate-notice-v2', 'task', { 'is-loading': isLoading } ) }>
			{ isLoading && <Spinner /> }
			<div className="celebrate-notice-v2__text task__text">
				<h2 className="celebrate-notice-v2__title task__title">{ title }</h2>
				<p className="celebrate-notice-v2__description task__description">{ description }</p>
				<div className="celebrate-notice-v2__actions task__actions">
					<Button
						className="celebrate-notice-v2__action task__action"
						primary
						onClick={ showNextTask }
					>
						{ actionText }
					</Button>

					{ showSkip && (
						<Button className="celebrate-notice-v2__skip task__skip is-link" onClick={ skip }>
							{ skipText }
						</Button>
					) }
				</div>
			</div>
			{ isDesktop() && (
				<div className="celebrate-notice-v2__illustration task__illustration">
					<img src={ illustration } alt="" />
				</div>
			) }
		</div>
	);
};

const mapStateToProps = ( state ) => ( {
	siteId: getSelectedSiteId( state ),
} );

export default connect( mapStateToProps )( CelebrateNotice );

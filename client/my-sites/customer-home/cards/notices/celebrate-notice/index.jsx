import { Button, Spinner } from '@automattic/components';
import { isDesktop } from '@automattic/viewport';
import clsx from 'clsx';
import { useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import fireworksIllustration from 'calypso/assets/images/customer-home/illustration--fireworks-v2.svg';
import useSkipCurrentViewMutation from 'calypso/data/home/use-skip-current-view-mutation';
import { composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const CelebrateNotice = ( {
	actionText,
	description,
	noticeId,
	illustration = fireworksIllustration,
	onSkip,
	showAction = true,
	showSkip = false,
	skipText,
	siteId,
	title,
	tracksEventExtras = {},
} ) => {
	const [ isLoading, setIsLoading ] = useState( false );
	const dispatch = useDispatch();
	const { skipCurrentView } = useSkipCurrentViewMutation( siteId );

	const showActions = showAction || showSkip;
	const showNextTask = () => {
		setIsLoading( true );
		skipCurrentView();

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
		setIsLoading( true );
		skipCurrentView();
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
		<div
			className={ clsx( 'celebrate-notice', 'task', 'customer-home__card', 'is-large-hero', {
				'is-loading': isLoading,
			} ) }
		>
			{ isLoading && <Spinner /> }
			<div className="celebrate-notice__text task__text">
				<h2 className="celebrate-notice__title task__title">{ title }</h2>
				<p className="celebrate-notice__description task__description">{ description }</p>
				{ showActions && (
					<div className="celebrate-notice__actions task__actions">
						{ showAction && (
							<Button
								className="celebrate-notice__action task__action"
								primary
								onClick={ showNextTask }
							>
								{ actionText }
							</Button>
						) }

						{ showSkip && (
							<Button className="celebrate-notice__skip task__skip is-link" onClick={ skip }>
								{ skipText }
							</Button>
						) }
					</div>
				) }
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
	};
};

export default connect( mapStateToProps )( CelebrateNotice );

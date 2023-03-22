import { Button, Spinner, LoadingPlaceholder } from '@automattic/components';
import { isDesktop } from '@automattic/viewport';
import styled from '@emotion/styled';
import classnames from 'classnames';
import { useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import fireworksIllustration from 'calypso/assets/images/customer-home/illustration--fireworks-v2.svg';
import useSkipCurrentViewMutation from 'calypso/data/home/use-skip-current-view-mutation';
import { composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const TitlePlaceholder = styled( LoadingPlaceholder )( {
	height: 48,
	width: '50%',
	marginBottom: '1.5em',
} );
const DescriptionPlaceholder = styled( LoadingPlaceholder )( {
	height: 24,
	width: '90%',
	marginBottom: '0.5em',
} );
const IllustationPlaceholder = styled( LoadingPlaceholder )( {
	height: 244,
	width: '100%',
} );

const CelebrateNoticePlaceholderTextContainer = styled.div( {
	className: 'task__text',
	flex: 1,
} );

export const CelebrateNoticePlaceholder = () => {
	return (
		<div className="task">
			<CelebrateNoticePlaceholderTextContainer>
				<div className="task__title">
					<TitlePlaceholder />
				</div>
				<div className="task__description">
					<DescriptionPlaceholder />
					<DescriptionPlaceholder />
					<DescriptionPlaceholder />
				</div>
			</CelebrateNoticePlaceholderTextContainer>
			{ isDesktop() && (
				<div className="task__illustration">
					<IllustationPlaceholder />
				</div>
			) }
		</div>
	);
};

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
		<div className={ classnames( 'celebrate-notice', 'task', { 'is-loading': isLoading } ) }>
			{ isLoading && <Spinner /> }
			<div className="celebrate-notice__text task__text">
				<h2 className="celebrate-notice__title task__title">{ title }</h2>
				<p className="celebrate-notice__description task__description">{ description }</p>
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

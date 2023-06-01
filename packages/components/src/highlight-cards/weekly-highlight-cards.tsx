import config from '@automattic/calypso-config';
import {
	commentContent,
	Icon,
	people,
	starEmpty,
	info,
	moreVertical,
	check,
} from '@wordpress/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState, useRef, useCallback } from 'react';
import { eye } from '../icons';
import Popover from '../popover';
import { comparingInfoBarsChart, comparingInfoRangeChart } from './charts';
import CountComparisonCard from './count-comparison-card';
import './style.scss';

type WeeklyHighlightCardsProps = {
	className?: string;
	counts: {
		comments: number | null;
		likes: number | null;
		views: number | null;
		visitors: number | null;
	};
	previousCounts: {
		comments: number | null;
		likes: number | null;
		views: number | null;
		visitors: number | null;
	};
	showValueTooltip?: boolean | null;
	onClickComments: ( event: MouseEvent ) => void;
	onClickLikes: ( event: MouseEvent ) => void;
	onClickViews: ( event: MouseEvent ) => void;
	onClickVisitors: ( event: MouseEvent ) => void;
	onTogglePeriod: ( period: string ) => void;
	currentPeriod: string;
};

export const PAST_SEVEN_DAYS = 'past_seven_days';
export const PAST_THIRTY_DAYS = 'past_thirty_days';
export const BETWEEN_PAST_EIGHT_AND_FIFTEEN_DAYS = 'between_past_eight_and_fifteen_days';
export const BETWEEN_PAST_THIRTY_ONE_AND_SIXTY_DAYS = 'between_past_thirty_one_and_sixty_days';

export default function WeeklyHighlightCards( {
	className,
	counts,
	onClickComments,
	onClickLikes,
	onClickViews,
	onClickVisitors,
	onTogglePeriod,
	previousCounts,
	showValueTooltip,
	currentPeriod,
}: WeeklyHighlightCardsProps ) {
	const translate = useTranslate();

	// @TODO: Fetch the state from API to determine whether showing the settings tooltip.
	const showSettingsTooltip =
		sessionStorage.getItem( 'jp-stats-settings-tooltip' ) === '1' ? false : true;

	const textRef = useRef( null );
	const settingsActionRef = useRef( null );
	const [ isTooltipVisible, setTooltipVisible ] = useState( true );
	const [ isSettingsTooltipVisible, setSettingsTooltipVisible ] = useState( showSettingsTooltip );
	const [ isPopoverVisible, setPopoverVisible ] = useState( false );

	// @TODO: Set the popover to disappear when the users click outside of the popover.
	const togglePopoverMenu = useCallback( () => {
		setPopoverVisible( ( isVisible ) => {
			return ! isVisible;
		} );
	}, [] );

	// @TODO: Update the state when users dismiss the settings tooltip.
	const dismissSettingsTooltip = useCallback( () => {
		sessionStorage.setItem( 'jp-stats-settings-tooltip', '1' );
		setSettingsTooltipVisible( false );
	}, [] );

	const isHighlightsSettingsEnabled = config.isEnabled( 'stats/highlights-settings' );

	return (
		<div className={ classNames( 'highlight-cards', className ?? null ) }>
			<h3 className="highlight-cards-heading">
				<span>
					{ currentPeriod === PAST_THIRTY_DAYS
						? translate( '30-day highlights' )
						: translate( '7-day highlights' ) }
				</span>

				{ isHighlightsSettingsEnabled && (
					<small className="highlight-cards-heading__description">
						{ currentPeriod === PAST_THIRTY_DAYS
							? translate( 'Compared to previous 30 days' )
							: translate( 'Compared to previous 7 days' ) }
					</small>
				) }

				{ ! isHighlightsSettingsEnabled && (
					<div className="highlight-cards-heading__tooltip">
						<span
							className="highlight-cards-heading-icon"
							ref={ textRef }
							onMouseEnter={ () => setTooltipVisible( true ) }
							onMouseLeave={ () => setTooltipVisible( false ) }
						>
							<Icon className="gridicon" icon={ info } />
						</span>
						<Popover
							className="tooltip tooltip--darker highlight-card-tooltip"
							isVisible={ isTooltipVisible }
							position="bottom right"
							context={ textRef.current }
						>
							<div className="highlight-card-tooltip-content comparing-info">
								<p>
									{ translate( 'Highlights displayed are for the last 7 days, excluding today.' ) }
								</p>
								<p>
									{ translate(
										'Trends shown are in comparison to the previous 7 days before that.'
									) }
								</p>
								<div className="comparing-info-chart">
									<small>
										{ translate( '%(fourteen)d days {{vs/}} %(seven)d days', {
											components: {
												vs: <span>vs</span>,
											},
											args: {
												fourteen: 14,
												seven: 7,
											},
										} ) }
									</small>
									{ comparingInfoRangeChart }
									{ comparingInfoBarsChart }
								</div>
							</div>
						</Popover>
					</div>
				) }

				{ isHighlightsSettingsEnabled && (
					<div className="highlight-cards-heading__settings">
						<button
							className="highlight-cards-heading__settings-action"
							ref={ settingsActionRef }
							onClick={ togglePopoverMenu }
						>
							<Icon className="gridicon" icon={ moreVertical } />
						</button>
						<Popover
							className="tooltip tooltip--darker highlight-card-tooltip highlight-card__settings-tooltip"
							isVisible={ isSettingsTooltipVisible }
							position="bottom left"
							context={ settingsActionRef.current }
						>
							<div className="highlight-card-tooltip-content">
								<p>
									{ translate(
										'You can now tailor your site highlights by adjusting the time range.'
									) }
								</p>
								<button
									onClick={ () => {
										dismissSettingsTooltip();
									} }
								>
									{ translate( 'Got it' ) }
								</button>
							</div>
						</Popover>
						<Popover
							className="tooltip highlight-card-popover"
							isVisible={ isPopoverVisible }
							position="bottom left"
							context={ settingsActionRef.current }
							focusOnShow={ false }
						>
							<button
								onClick={ () => {
									onTogglePeriod( PAST_SEVEN_DAYS );
								} }
							>
								{ translate( '7-day highlights' ) }
								{ currentPeriod === PAST_SEVEN_DAYS && (
									<Icon className="gridicon" icon={ check } />
								) }
							</button>
							<button
								onClick={ () => {
									onTogglePeriod( PAST_THIRTY_DAYS );
								} }
							>
								{ translate( '30-day highlights' ) }
								{ currentPeriod === PAST_THIRTY_DAYS && (
									<Icon className="gridicon" icon={ check } />
								) }
							</button>
						</Popover>
					</div>
				) }
			</h3>

			<div className="highlight-cards-list">
				<CountComparisonCard
					heading={ translate( 'Visitors' ) }
					icon={ <Icon icon={ people } /> }
					count={ counts?.visitors ?? null }
					previousCount={ previousCounts?.visitors ?? null }
					showValueTooltip={ showValueTooltip }
					onClick={ onClickVisitors }
				/>
				<CountComparisonCard
					heading={ translate( 'Views' ) }
					icon={ <Icon icon={ eye } /> }
					count={ counts?.views ?? null }
					previousCount={ previousCounts?.views ?? null }
					showValueTooltip={ showValueTooltip }
					onClick={ onClickViews }
				/>
				<CountComparisonCard
					heading={ translate( 'Likes' ) }
					icon={ <Icon icon={ starEmpty } /> }
					count={ counts?.likes ?? null }
					previousCount={ previousCounts?.likes ?? null }
					showValueTooltip={ showValueTooltip }
					onClick={ onClickLikes }
				/>
				<CountComparisonCard
					heading={ translate( 'Comments' ) }
					icon={ <Icon icon={ commentContent } /> }
					count={ counts?.comments ?? null }
					previousCount={ previousCounts?.comments ?? null }
					showValueTooltip={ showValueTooltip }
					onClick={ onClickComments }
				/>
			</div>
		</div>
	);
}

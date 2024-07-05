import {
	commentContent,
	Icon,
	people,
	starEmpty,
	info,
	moreVertical,
	check,
} from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState, useRef, useCallback } from 'react';
import ComponentSwapper from '../component-swapper';
import { eye } from '../icons';
import Popover from '../popover';
import { comparingInfoBarsChart, comparingInfoRangeChart } from './charts';
import CountComparisonCard from './count-comparison-card';
import MobileHighlightCardListing from './mobile-highlight-cards';

import './style.scss';

type HighlightCardCounts = {
	comments: number | null;
	likes: number | null;
	views: number | null;
	visitors: number | null;
};

type WeeklyHighlightCardsProps = {
	className?: string;
	counts: HighlightCardCounts;
	previousCounts: HighlightCardCounts;
	showValueTooltip?: boolean | null;
	onClickComments: ( event: MouseEvent ) => void;
	onClickLikes: ( event: MouseEvent ) => void;
	onClickViews: ( event: MouseEvent ) => void;
	onClickVisitors: ( event: MouseEvent ) => void;
	onTogglePeriod: ( period: string ) => void;
	currentPeriod: string;
	onSettingsTooltipDismiss: () => void;
	showSettingsTooltip: boolean;
	isHighlightsSettingsSupported?: boolean;
};

type HighlightCardsSettingsProps = {
	onTogglePeriod: ( period: string ) => void;
	currentPeriod: string;
	onTooltipDismiss: () => void;
	showTooltip: boolean;
};

export const PAST_SEVEN_DAYS = 'past_seven_days';
export const PAST_THIRTY_DAYS = 'past_thirty_days';
export const BETWEEN_PAST_EIGHT_AND_FIFTEEN_DAYS = 'between_past_eight_and_fifteen_days';
export const BETWEEN_PAST_THIRTY_ONE_AND_SIXTY_DAYS = 'between_past_thirty_one_and_sixty_days';

const HighlightCardsSettings = function ( {
	currentPeriod,
	onTogglePeriod,
	onTooltipDismiss,
	showTooltip = false,
}: HighlightCardsSettingsProps ) {
	const translate = useTranslate();

	const [ isPopoverVisible, setPopoverVisible ] = useState( false );

	const togglePopoverMenu = useCallback( () => {
		onTooltipDismiss();
		setPopoverVisible( ( isVisible ) => {
			return ! isVisible;
		} );
	}, [ onTooltipDismiss ] );

	// Use state to update the ref of the setting action button to avoid null element.
	const [ settingsActionRef, setSettingsActionRef ] = useState(
		useRef< HTMLButtonElement >( null )
	);

	const buttonRefCallback = useCallback( ( node: HTMLButtonElement ) => {
		if ( settingsActionRef.current === null ) {
			setSettingsActionRef( { current: node } );
		}
	}, [] );

	return (
		<div className="highlight-cards-heading__settings">
			<button
				className="highlight-cards-heading__settings-action"
				ref={ buttonRefCallback }
				onClick={ togglePopoverMenu }
			>
				<Icon className="gridicon" icon={ moreVertical } />
			</button>
			<Popover
				className="tooltip tooltip--darker highlight-card-tooltip highlight-card__settings-tooltip"
				isVisible={ showTooltip }
				position="bottom left"
				context={ settingsActionRef.current }
				autoRepositionOnInitialLoad
			>
				<div className="highlight-card-tooltip-content">
					<p>
						{ translate( 'You can now tailor your site highlights by adjusting the time range.' ) }
					</p>
					<button onClick={ onTooltipDismiss }>{ translate( 'Got it' ) }</button>
				</div>
			</Popover>
			<Popover
				className="tooltip highlight-card-popover"
				isVisible={ isPopoverVisible }
				position="bottom left"
				context={ settingsActionRef.current }
				focusOnShow={ false }
				onClose={ () => {
					setPopoverVisible( false );
				} }
			>
				<button
					onClick={ () => {
						onTogglePeriod( PAST_SEVEN_DAYS );
					} }
				>
					{ translate( '7-day highlights' ) }
					{ currentPeriod === PAST_SEVEN_DAYS && <Icon className="gridicon" icon={ check } /> }
				</button>
				<button
					onClick={ () => {
						onTogglePeriod( PAST_THIRTY_DAYS );
					} }
				>
					{ translate( '30-day highlights' ) }
					{ currentPeriod === PAST_THIRTY_DAYS && <Icon className="gridicon" icon={ check } /> }
				</button>
			</Popover>
		</div>
	);
};

type WeeklyHighlighCardsStandardProps = {
	counts: HighlightCardCounts;
	previousCounts: HighlightCardCounts;
	showValueTooltip?: boolean | null;
	onClickComments: ( event: MouseEvent ) => void;
	onClickLikes: ( event: MouseEvent ) => void;
	onClickViews: ( event: MouseEvent ) => void;
	onClickVisitors: ( event: MouseEvent ) => void;
};

function WeeklyHighlighCardsStandard( {
	counts,
	previousCounts,
	showValueTooltip,
	onClickComments,
	onClickLikes,
	onClickViews,
	onClickVisitors,
}: WeeklyHighlighCardsStandardProps ) {
	const translate = useTranslate();
	return (
		<div className="highlight-cards-list">
			<CountComparisonCard
				heading={ translate( 'Views' ) }
				icon={ <Icon icon={ eye } /> }
				count={ counts?.views ?? null }
				previousCount={ previousCounts?.views ?? null }
				showValueTooltip={ showValueTooltip }
				onClick={ onClickViews }
			/>
			<CountComparisonCard
				heading={ translate( 'Visitors' ) }
				icon={ <Icon icon={ people } /> }
				count={ counts?.visitors ?? null }
				previousCount={ previousCounts?.visitors ?? null }
				showValueTooltip={ showValueTooltip }
				onClick={ onClickVisitors }
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
	);
}

type WeeklyHighlighCardsMobileProps = {
	counts: HighlightCardCounts;
	previousCounts: HighlightCardCounts;
};

function WeeklyHighlighCardsMobile( { counts, previousCounts }: WeeklyHighlighCardsMobileProps ) {
	const translate = useTranslate();
	const highlights = [
		{
			heading: translate( 'Visitors' ),
			count: counts?.visitors,
			previousCount: previousCounts?.visitors,
			icon: people,
		},
		{
			heading: translate( 'Views' ),
			count: counts?.views,
			previousCount: previousCounts?.views,
			icon: eye,
		},
		{
			heading: translate( 'Likes' ),
			count: counts?.likes,
			previousCount: previousCounts?.likes,
			icon: starEmpty,
		},
		{
			heading: translate( 'Comments' ),
			count: counts?.comments,
			previousCount: previousCounts?.comments,
			icon: commentContent,
		},
	];

	return <MobileHighlightCardListing highlights={ highlights } />;
}

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
	onSettingsTooltipDismiss,
	showSettingsTooltip,
	isHighlightsSettingsSupported = false,
}: WeeklyHighlightCardsProps ) {
	const translate = useTranslate();

	const textRef = useRef( null );
	const [ isTooltipVisible, setTooltipVisible ] = useState( false );

	return (
		<div className={ clsx( 'highlight-cards', className ?? null ) }>
			<h3 className="highlight-cards-heading">
				<span>
					{ currentPeriod === PAST_THIRTY_DAYS
						? translate( '30-day highlights' )
						: translate( '7-day highlights' ) }
				</span>

				{ isHighlightsSettingsSupported && (
					<small className="highlight-cards-heading__description">
						{ currentPeriod === PAST_THIRTY_DAYS
							? translate( 'Compared to previous 30 days' )
							: translate( 'Compared to previous 7 days' ) }
					</small>
				) }

				{ ! isHighlightsSettingsSupported && (
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

				{ isHighlightsSettingsSupported && (
					<HighlightCardsSettings
						currentPeriod={ currentPeriod }
						onTogglePeriod={ onTogglePeriod }
						onTooltipDismiss={ onSettingsTooltipDismiss }
						showTooltip={ showSettingsTooltip }
					/>
				) }
			</h3>

			<ComponentSwapper
				breakpoint="<660px"
				breakpointActiveComponent={
					<WeeklyHighlighCardsMobile counts={ counts } previousCounts={ previousCounts } />
				}
				breakpointInactiveComponent={
					<WeeklyHighlighCardsStandard
						counts={ counts }
						previousCounts={ previousCounts }
						showValueTooltip={ showValueTooltip }
						onClickComments={ onClickComments }
						onClickLikes={ onClickLikes }
						onClickViews={ onClickViews }
						onClickVisitors={ onClickVisitors }
					/>
				}
			/>
		</div>
	);
}

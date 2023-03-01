import { commentContent, Icon, people, starEmpty, info } from '@wordpress/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState, useRef } from 'react';
import { eye } from '../icons';
import Popover from '../popover';
import { comparingInfoBarsChart, comparingInfoRangeChart } from './charts';
import HighlightCard from './highlight-card';
import './style.scss';

export type HighlightCardsProps = {
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
};

export default function HighlightCards( {
	className,
	counts,
	onClickComments,
	onClickLikes,
	onClickViews,
	onClickVisitors,
	previousCounts,
	showValueTooltip,
}: HighlightCardsProps ) {
	const translate = useTranslate();

	const textRef = useRef( null );
	const [ isTooltipVisible, setTooltipVisible ] = useState( false );

	return (
		<div className={ classNames( 'highlight-cards', className ?? null ) }>
			<h1 className="highlight-cards-heading">
				{ translate( '7-day highlights' ) }{ ' ' }
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
						<p>{ translate( 'Highlights displayed are for the last 7 days, excluding today.' ) }</p>
						<p>
							{ translate( 'Trends shown are in comparison to the previous 7 days before that.' ) }
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
			</h1>

			<div className="highlight-cards-list">
				<HighlightCard
					heading={ translate( 'Visitors' ) }
					icon={ <Icon icon={ people } /> }
					count={ counts?.visitors ?? null }
					previousCount={ previousCounts?.visitors ?? null }
					showValueTooltip={ showValueTooltip }
					onClick={ onClickVisitors }
				/>
				<HighlightCard
					heading={ translate( 'Views' ) }
					icon={ <Icon icon={ eye } /> }
					count={ counts?.views ?? null }
					previousCount={ previousCounts?.views ?? null }
					showValueTooltip={ showValueTooltip }
					onClick={ onClickViews }
				/>
				<HighlightCard
					heading={ translate( 'Likes' ) }
					icon={ <Icon icon={ starEmpty } /> }
					count={ counts?.likes ?? null }
					previousCount={ previousCounts?.likes ?? null }
					showValueTooltip={ showValueTooltip }
					onClick={ onClickLikes }
				/>
				<HighlightCard
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

import { commentContent, Icon, people, starEmpty, info } from '@wordpress/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState, useRef } from 'react';
import { eye } from '../icons';
import Popover from '../popover';
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
				<>
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
							<p>Highlights displayed are for the last 7 days, excluding today.</p>
							<p>Trends shown are in comparison to the previous 7 days before that.</p>
							<div className="comparing-info-graph">
								<small>
									{ translate( '%(before)d days {{vs/}} %(after)d days', {
										components: {
											vs: <span>vs</span>,
										},
										args: {
											before: 14,
											after: 7,
										},
									} ) }
								</small>
								<svg
									width="132"
									height="4"
									viewBox="0 0 132 4"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<rect x="0.5" width="66" height="1" fill="#A7AAAD" />
									<rect
										x="66.5"
										y="1"
										width="3"
										height="1"
										transform="rotate(90 66.5 1)"
										fill="#A7AAAD"
									/>
									<rect
										x="1.5"
										y="1"
										width="3"
										height="1"
										transform="rotate(90 1.5 1)"
										fill="#A7AAAD"
									/>
									<rect x="65.5" width="66" height="1" fill="#F6F7F7" />
									<rect
										x="131.5"
										y="1"
										width="3"
										height="1"
										transform="rotate(90 131.5 1)"
										fill="#F6F7F7"
									/>
									<rect
										x="66.5"
										y="1"
										width="3"
										height="1"
										transform="rotate(90 66.5 1)"
										fill="#F6F7F7"
									/>
								</svg>
								<svg
									width="136"
									height="34"
									viewBox="0 0 136 34"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<rect width="136" height="34" fill="#101517" />
									<path
										d="M0 6C0 4.89543 0.895431 4 2 4H4C5.10457 4 6 4.89543 6 6V34H0V6Z"
										fill="#A7AAAD"
									/>
									<path
										d="M10 11C10 9.89543 10.8954 9 12 9H14C15.1046 9 16 9.89543 16 11V34H10V11Z"
										fill="#A7AAAD"
									/>
									<path
										d="M20 6C20 4.89543 20.8954 4 22 4H24C25.1046 4 26 4.89543 26 6V34H20V6Z"
										fill="#A7AAAD"
									/>
									<path
										d="M30 11C30 9.89543 30.8954 9 32 9H34C35.1046 9 36 9.89543 36 11V34H30V11Z"
										fill="#A7AAAD"
									/>
									<path
										d="M40 6C40 4.89543 40.8954 4 42 4H44C45.1046 4 46 4.89543 46 6V34H40V6Z"
										fill="#A7AAAD"
									/>
									<path
										d="M50 11C50 9.89543 50.8954 9 52 9H54C55.1046 9 56 9.89543 56 11V34H50V11Z"
										fill="#A7AAAD"
									/>
									<path
										d="M60 6C60 4.89543 60.8954 4 62 4H64C65.1046 4 66 4.89543 66 6V34H60V6Z"
										fill="#A7AAAD"
									/>
									<path
										d="M70 11C70 9.89543 70.8954 9 72 9H74C75.1046 9 76 9.89543 76 11V34H70V11Z"
										fill="#F6F7F7"
									/>
									<path
										d="M80 6C80 4.89543 80.8954 4 82 4H84C85.1046 4 86 4.89543 86 6V34H80V6Z"
										fill="#F6F7F7"
									/>
									<path
										d="M90 11C90 9.89543 90.8954 9 92 9H94C95.1046 9 96 9.89543 96 11V34H90V11Z"
										fill="#F6F7F7"
									/>
									<path
										d="M100 6C100 4.89543 100.895 4 102 4H104C105.105 4 106 4.89543 106 6V34H100V6Z"
										fill="#F6F7F7"
									/>
									<path
										d="M110 11C110 9.89543 110.895 9 112 9H114C115.105 9 116 9.89543 116 11V34H110V11Z"
										fill="#F6F7F7"
									/>
									<path
										d="M120 6C120 4.89543 120.895 4 122 4H124C125.105 4 126 4.89543 126 6V34H120V6Z"
										fill="#F6F7F7"
									/>
									<path
										d="M130 11C130 9.89543 130.895 9 132 9H134C135.105 9 136 9.89543 136 11V34H130V11Z"
										fill="#F6F7F7"
									/>
								</svg>
							</div>
						</div>
					</Popover>
				</>
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

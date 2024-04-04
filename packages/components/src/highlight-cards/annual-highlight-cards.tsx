import { comment, Icon, paragraph, people, postContent, starEmpty } from '@wordpress/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import ComponentSwapper from '../component-swapper';
import ShortenedNumber from '../number-formatters';
import CountComparisonCard from './count-comparison-card';

import './style.scss';

type AnnualHighlightCounts = {
	comments: number | null;
	likes: number | null;
	posts: number | null;
	words: number | null;
	followers: number | null;
};

type AnnualHighlightsMobileProps = {
	counts: AnnualHighlightCounts;
};

type AnnualHighlightsStandardProps = {
	counts: AnnualHighlightCounts;
};

type AnnualHighlightCardsProps = {
	className?: string;
	counts: AnnualHighlightCounts;
	titleHref?: string | null;
	year?: string | number | null;
	navigation?: React.ReactNode;
};

function AnnualHighlightsMobile( { counts }: AnnualHighlightsMobileProps ) {
	const translate = useTranslate();
	return (
		<div className="highlight-cards-list-mobile">
			<div className="highlight-cards-list-mobile__item" key="posts">
				<span className="highlight-cards-list-mobile__item-icon">
					<Icon icon={ postContent } />
				</span>
				<span className="highlight-cards-list-mobile__item-heading">{ translate( 'Posts' ) }</span>
				<span className="highlight-cards-list-mobile__item-count">
					<ShortenedNumber value={ counts?.posts ?? null } />
				</span>
			</div>
			<div className="highlight-cards-list-mobile__item" key="words">
				<span className="highlight-cards-list-mobile__item-icon">
					<Icon icon={ paragraph } />
				</span>
				<span className="highlight-cards-list-mobile__item-heading">{ translate( 'Words' ) }</span>
				<span className="highlight-cards-list-mobile__item-count">
					<ShortenedNumber value={ counts?.words ?? null } />
				</span>
			</div>
			<div className="highlight-cards-list-mobile__item" key="likes">
				<span className="highlight-cards-list-mobile__item-icon">
					<Icon icon={ starEmpty } />
				</span>
				<span className="highlight-cards-list-mobile__item-heading">{ translate( 'Likes' ) }</span>
				<span className="highlight-cards-list-mobile__item-count">
					<ShortenedNumber value={ counts?.likes ?? null } />
				</span>
			</div>
			<div className="highlight-cards-list-mobile__item" key="comments">
				<span className="highlight-cards-list-mobile__item-icon">
					<Icon icon={ comment } />
				</span>
				<span className="highlight-cards-list-mobile__item-heading">
					{ translate( 'Comments' ) }
				</span>
				<span className="highlight-cards-list-mobile__item-count">
					<ShortenedNumber value={ counts?.comments ?? null } />
				</span>
			</div>
			<div className="highlight-cards-list-mobile__item" key="subscribers">
				<span className="highlight-cards-list-mobile__item-icon">
					<Icon icon={ people } />
				</span>
				<span className="highlight-cards-list-mobile__item-heading">
					{ translate( 'Subscribers' ) }
				</span>
				<span className="highlight-cards-list-mobile__item-count">
					<ShortenedNumber value={ counts?.followers ?? null } />
				</span>
			</div>
		</div>
	);
}

function AnnualHighlightsStandard( { counts }: AnnualHighlightsStandardProps ) {
	const translate = useTranslate();
	return (
		<div className="highlight-cards-list">
			<CountComparisonCard
				heading={ translate( 'Posts' ) }
				icon={ <Icon icon={ postContent } /> }
				count={ counts?.posts ?? null }
				showValueTooltip
			/>
			<CountComparisonCard
				heading={ translate( 'Words' ) }
				icon={ <Icon icon={ paragraph } /> }
				count={ counts?.words ?? null }
				showValueTooltip
			/>
			<CountComparisonCard
				heading={ translate( 'Likes' ) }
				icon={ <Icon icon={ starEmpty } /> }
				count={ counts?.likes ?? null }
				showValueTooltip
			/>
			<CountComparisonCard
				heading={ translate( 'Comments' ) }
				icon={ <Icon icon={ comment } /> }
				count={ counts?.comments ?? null }
				showValueTooltip
			/>
			<CountComparisonCard
				heading={ translate( 'Subscribers' ) }
				icon={ <Icon icon={ people } /> }
				count={ counts?.followers ?? null }
				showValueTooltip
			/>
		</div>
	);
}

export default function AnnualHighlightCards( {
	className,
	counts,
	titleHref,
	year,
	navigation,
}: AnnualHighlightCardsProps ) {
	const translate = useTranslate();

	const header = (
		<h3 className="highlight-cards-heading">
			{ year != null && Number.isFinite( year )
				? translate( '%(year)s in review', { args: { year } } )
				: translate( 'Year in review' ) }{ ' ' }
			{ titleHref ? (
				<small>
					<a className="highlight-cards-heading-wrapper" href={ titleHref }>
						{ translate( 'View all annual insights' ) }
					</a>
				</small>
			) : null }
		</h3>
	);

	return (
		<div className={ classNames( 'highlight-cards', className ?? null ) }>
			<div className="highlight-year-navigation">
				{ header }
				{ navigation }
			</div>

			<ComponentSwapper
				breakpoint="<660px"
				breakpointActiveComponent={ <AnnualHighlightsMobile counts={ counts } /> }
				breakpointInactiveComponent={ <AnnualHighlightsStandard counts={ counts } /> }
			/>
		</div>
	);
}

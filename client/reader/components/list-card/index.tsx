import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { SiteIconsRow } from 'calypso/reader/components/site-icons-row';

import './style.scss';

interface ListCardItem {
	site_name: string;
	site_icon: string | null;
}

interface ListCardProps {
	title: string;
	description: string;
	owner: string;
	itemCount: number;
	tags: string[];
	items: ListCardItem[];
	listUrl: string;
	isLoadingItems: boolean;
	onOpenList?: () => void;
}

export function ListCard( {
	title,
	description,
	owner,
	itemCount,
	tags,
	items,
	listUrl,
	isLoadingItems,
	onOpenList,
}: ListCardProps ) {
	const translate = useTranslate();

	return (
		<div className="list-card">
			<div className="list-card__header">
				<div className="list-card__meta">
					<h3 className="list-card__title">{ title }</h3>
					<span className="list-card__byline">
						{ translate( 'by %(owner)s', { args: { owner } } ) }
						{ ' \u00B7 ' }
						{ translate( '%(count)d site', '%(count)d sites', {
							count: itemCount,
							args: { count: itemCount },
						} ) }
					</span>
				</div>
				<Button
					className="list-card__open-button"
					variant="primary"
					href={ listUrl }
					onClick={ onOpenList }
				>
					{ translate( 'Open list' ) }
				</Button>
			</div>

			<p className="list-card__description">{ description }</p>

			{ tags.length > 0 && (
				<div className="list-card__tags">
					{ tags.map( ( tag ) => (
						<span key={ tag } className="list-card__tag">
							{ tag }
						</span>
					) ) }
				</div>
			) }

			{ isLoadingItems ? (
				<div className="list-card__icons-skeleton">
					{ Array.from( { length: 5 } ).map( ( _, i ) => (
						<span key={ i } className="list-card__icon-placeholder" />
					) ) }
				</div>
			) : (
				<SiteIconsRow items={ items } totalCount={ itemCount } />
			) }
		</div>
	);
}

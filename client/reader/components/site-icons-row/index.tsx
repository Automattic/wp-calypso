import './style.scss';

const MAX_ICONS = 10;

interface SiteIconItem {
	site_name: string | null;
	site_icon: string | null;
}

interface SiteIconsRowProps {
	items: SiteIconItem[];
	totalCount: number;
}

function getInitials( name: string | null ): string {
	return name ? name.slice( 0, 2 ) : '';
}

function SiteIcon( { item }: { item: SiteIconItem } ) {
	const name = item.site_name ?? '';

	if ( item.site_icon ) {
		return (
			<img className="site-icons-row__icon" src={ item.site_icon } alt={ name } loading="lazy" />
		);
	}

	return (
		<span className="site-icons-row__icon site-icons-row__icon--initials" aria-label={ name }>
			{ getInitials( item.site_name ) }
		</span>
	);
}

export function SiteIconsRow( { items, totalCount }: SiteIconsRowProps ) {
	if ( ! items || items.length === 0 ) {
		return null;
	}

	const displayedItems = items.slice( 0, MAX_ICONS );
	const overflowCount = totalCount - displayedItems.length;

	return (
		<div className="site-icons-row">
			{ displayedItems.map( ( item, index ) => (
				<SiteIcon key={ index } item={ item } />
			) ) }
			{ overflowCount > 0 && (
				<span className="site-icons-row__icon site-icons-row__overflow">+{ overflowCount }</span>
			) }
		</div>
	);
}

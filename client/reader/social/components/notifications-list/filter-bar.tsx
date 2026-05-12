import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { CHIP_FILTERS, type ChipFilter } from './filter';

interface Props {
	value: ChipFilter;
	onChange: ( next: ChipFilter ) => void;
}

export function NotificationsFilterBar( { value, onChange }: Props ) {
	const translate = useTranslate();
	const labels: Record< ChipFilter, string > = {
		all: translate( 'All' ) as string,
		conversations: translate( 'Conversations' ) as string,
		likes: translate( 'Likes' ) as string,
		reposts: translate( 'Reposts' ) as string,
		follows: translate( 'Follows' ) as string,
	};
	return (
		<div
			role="group"
			aria-label={ translate( 'Filter notifications by type' ) as string }
			className="social-notifications-filter-bar"
		>
			{ CHIP_FILTERS.map( ( chip ) => {
				const isActive = chip === value;
				return (
					<button
						key={ chip }
						type="button"
						aria-pressed={ isActive }
						className={ clsx( 'social-notifications-filter-bar__chip', {
							'is-active': isActive,
						} ) }
						onClick={ () => onChange( chip ) }
					>
						{ labels[ chip ] }
					</button>
				);
			} ) }
		</div>
	);
}

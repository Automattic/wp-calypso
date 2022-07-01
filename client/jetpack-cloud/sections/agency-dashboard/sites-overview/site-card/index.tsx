import { Card, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { useState, ReactElement, MouseEvent, KeyboardEvent } from 'react';
import { useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import SiteActions from '../site-actions';
import SiteErrorContent from '../site-error-content';
import SiteStatusContent from '../site-status-content';
import type { SiteData, SiteColumns } from '../types';

import './style.scss';

interface Props {
	rows: SiteData;
	columns: SiteColumns;
}

export default function SiteCard( { rows, columns }: Props ): ReactElement {
	const dispatch = useDispatch();

	const [ isExpanded, setIsExpanded ] = useState( false );

	const toggleIsExpanded = (
		event: MouseEvent< HTMLSpanElement > | KeyboardEvent< HTMLSpanElement >
	) => {
		// Don't toogle the card when clicked on set/remove favorite
		if ( ( event?.target as HTMLElement )?.closest( '.site-set-favorite__favorite-icon' ) ) {
			return;
		}
		setIsExpanded( ( expanded ) => {
			if ( ! expanded ) {
				dispatch( recordTracksEvent( 'calypso_jetpack_agency_dashboard_card_expand' ) );
			}
			return ! expanded;
		} );
	};

	const toggleContent = isExpanded ? (
		<Gridicon icon="chevron-up" className="site-card__card-toggle-icon" size={ 18 } />
	) : (
		<Gridicon icon="chevron-down" className="site-card__card-toggle-icon" size={ 18 } />
	);

	const headerItem = rows[ 'site' ];

	const site = rows.site;
	const siteError = site.error || rows.monitor.error;
	const siteUrl = site.value.url;
	const isFavorite = rows.isFavorite;

	return (
		<Card className="site-card__card" compact>
			<div className="site-card__header">
				<span
					className="site-card__title"
					onClick={ toggleIsExpanded }
					onKeyPress={ toggleIsExpanded }
					role="button"
					tabIndex={ 0 }
				>
					{ toggleContent }
					<SiteStatusContent rows={ rows } type={ headerItem.type } isFavorite={ isFavorite } />
				</span>
				<SiteActions site={ site } siteError={ siteError } />
			</div>

			{ isExpanded && (
				<div className="site-card__expanded-content">
					{ site.error && <SiteErrorContent siteUrl={ siteUrl } /> }
					{ columns
						.filter( ( column ) => column.key !== 'site' )
						.map( ( column, index ) => {
							const row = rows[ column.key ];
							if ( row.type ) {
								return (
									<div
										className={ classNames(
											'site-card__expanded-content-list',
											! site.error && 'site-card__content-list-no-error'
										) }
										key={ index }
									>
										<span className="site-card__expanded-content-key">{ column.title }</span>
										<span className="site-card__expanded-content-value">
											<SiteStatusContent rows={ rows } type={ row.type } />
										</span>
									</div>
								);
							}
						} ) }
				</div>
			) }
		</Card>
	);
}

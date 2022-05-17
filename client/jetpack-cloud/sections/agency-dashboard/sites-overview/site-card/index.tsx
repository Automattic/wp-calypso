import { Card, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { useState, ReactElement } from 'react';
import SiteErrorContent from '../site-error-content';
import SiteStatusContent from '../site-status-content';
import type { SiteData, SiteColumns } from '../types';

import './style.scss';

interface Props {
	rows: SiteData;
	columns: SiteColumns;
}

export default function SiteCard( { rows, columns }: Props ): ReactElement {
	const [ isExpanded, setIsExpanded ] = useState( false );

	const toggleIsExpanded = () => {
		setIsExpanded( ( prevValue ) => ! prevValue );
	};

	const toggleContent = isExpanded ? (
		<Gridicon icon="chevron-up" className="site-card__vertical-align-middle" size={ 18 } />
	) : (
		<Gridicon icon="chevron-down" className="site-card__vertical-align-middle" size={ 18 } />
	);

	const headerItem = rows[ 'site' ];

	const site = rows.site;
	const siteError = site.error;
	const siteUrl = site.value.url;

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
					<SiteStatusContent rows={ rows } type={ headerItem.type } />
				</span>
				<div className="site-card__actions-small-screen">
					<Gridicon icon="ellipsis" size={ 18 } className="site-card__all-actions" />
				</div>
			</div>

			{ isExpanded && (
				<div className="site-card__expanded-content">
					{ siteError && <SiteErrorContent siteUrl={ siteUrl } /> }
					{ columns
						.filter( ( column ) => column.key !== 'site' )
						.map( ( column, index ) => {
							const row = rows[ column.key ];
							if ( row.type ) {
								return (
									<div
										className={ classNames(
											'site-card__expanded-content-list',
											! siteError && 'site-card__content-list-no-error'
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

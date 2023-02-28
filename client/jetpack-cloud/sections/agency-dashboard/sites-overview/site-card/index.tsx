import { Card, Gridicon, Button } from '@automattic/components';
import { Icon, chevronDown, chevronUp } from '@wordpress/icons';
import classNames from 'classnames';
import { useState, useCallback, MouseEvent, KeyboardEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useFetchTestConnection from 'calypso/data/agency-dashboard/use-fetch-test-connection';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	getSelectedLicenses,
	getSelectedLicensesSiteId,
} from 'calypso/state/jetpack-agency-dashboard/selectors';
import { getIsPartnerOAuthTokenLoaded } from 'calypso/state/partner-portal/partner/selectors';
import SiteActions from '../site-actions';
import SiteErrorContent from '../site-error-content';
import SiteStatusContent from '../site-status-content';
import type { SiteData, SiteColumns, AllowedTypes } from '../types';

import './style.scss';

interface Props {
	rows: SiteData;
	columns: SiteColumns;
}

export default function SiteCard( { rows, columns }: Props ) {
	const dispatch = useDispatch();
	const isPartnerOAuthTokenLoaded = useSelector( getIsPartnerOAuthTokenLoaded );

	const [ isExpanded, setIsExpanded ] = useState( false );
	const [ expandedColumn, setExpandedColumn ] = useState< AllowedTypes | null >( null );
	const blogId = rows.site.value.blog_id;
	const isConnectionHealthy = rows.site.value?.is_connection_healthy;

	const { data } = useFetchTestConnection( isPartnerOAuthTokenLoaded, isConnectionHealthy, blogId );

	const isSiteConnected = data ? data.connected : true;

	const handleSetExpandedColumn = ( column: AllowedTypes ) => {
		setExpandedColumn( expandedColumn === column ? null : column );
	};

	const toggleIsExpanded = useCallback(
		( event: MouseEvent< HTMLSpanElement > | KeyboardEvent< HTMLSpanElement > ) => {
			// Don't toogle the card when clicked on actions like set/remove favorite or select site.
			if ( ( event?.target as HTMLElement )?.closest( '.disable-card-expand' ) ) {
				return;
			}
			setIsExpanded( ( expanded ) => {
				if ( ! expanded ) {
					dispatch( recordTracksEvent( 'calypso_jetpack_agency_dashboard_card_expand' ) );
				}
				return ! expanded;
			} );
		},
		[ setIsExpanded, dispatch ]
	);

	const toggleContent = isExpanded ? (
		<Gridicon icon="chevron-up" className="site-card__card-toggle-icon" size={ 18 } />
	) : (
		<Gridicon icon="chevron-down" className="site-card__card-toggle-icon" size={ 18 } />
	);

	const headerItem = rows[ 'site' ];

	const site = rows.site;
	const siteError = site.error || rows.monitor.error || ! isSiteConnected;
	const siteUrl = site.value.url;
	const isFavorite = rows.isFavorite;

	const selectedLicenses = useSelector( getSelectedLicenses );
	const selectedLicensesSiteId = useSelector( getSelectedLicensesSiteId );

	const currentSiteHasSelectedLicenses =
		selectedLicensesSiteId === blogId && selectedLicenses?.length;

	// We should disable the license selection for all sites, but the active one.
	const shouldDisableLicenseSelection =
		selectedLicenses?.length && ! currentSiteHasSelectedLicenses;

	return (
		<Card
			className={ classNames( 'site-card__card', {
				'site-card__card-disabled': shouldDisableLicenseSelection,
				'site-card__card-active': currentSiteHasSelectedLicenses,
			} ) }
			compact
		>
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
					{ ( site.error || ! isSiteConnected ) && <SiteErrorContent siteUrl={ siteUrl } /> }
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
										<div className="site-card__expanded-content-header">
											<span className="site-card__expanded-content-key">{ column.title }</span>
											<span className="site-card__expanded-content-value">
												<span className="site-card__expanded-content-status">
													<SiteStatusContent rows={ rows } type={ row.type } />
												</span>
												<span className="site-card__expanded-column">
													{ column.isExpandable && (
														<Button
															borderless
															onClick={ () => handleSetExpandedColumn( column.key ) }
														>
															<Icon
																icon={ expandedColumn === column.key ? chevronUp : chevronDown }
															/>
														</Button>
													) }
												</span>
											</span>
										</div>
									</div>
								);
							}
						} ) }
				</div>
			) }
		</Card>
	);
}

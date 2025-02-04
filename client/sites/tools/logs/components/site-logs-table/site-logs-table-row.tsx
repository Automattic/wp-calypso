import { Button, Badge } from '@automattic/components';
import { Icon, chevronDown, chevronUp } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import moment from 'moment';
import { Fragment, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { SiteLogsData } from 'calypso/data/hosting/use-site-logs-query';
import { useSelector } from 'calypso/state';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { LogType } from '../..';
import SiteLogsExpandedContent from './site-logs-expanded-content';
import './style.scss';

interface Props {
	columns: string[];
	log: SiteLogsData[ 'logs' ][ 0 ];
	siteGmtOffset: number;
	logType?: LogType;
}

export default function SiteLogsTableRow( { columns, log, siteGmtOffset, logType }: Props ) {
	const { __ } = useI18n();
	const [ isExpanded, setIsExpanded ] = useState( false );
	const expandedId = useRef( uuidv4() ).current;
	const locale = useSelector( getCurrentUserLocale );

	const firstColumnValue = log[ columns[ 0 ] ] as string; // Get the value of the first column
	const formattedSeverities = {
		User: __( 'User' ),
		Warning: __( 'Warning' ),
		Deprecated: __( 'Deprecated' ),
		'Fatal error': __( 'Fatal error' ),
	};

	const specifiedLogs =
		logType === 'php'
			? [ 'message', 'timestamp', 'kind', 'name', 'file', 'line' ]
			: [ 'timestamp', 'body_bytes_sent', 'cached', 'http_host', 'http_referer' ];

	return (
		<Fragment>
			<tr
				className={ clsx( firstColumnValue, 'site-logs-table__table-row', {
					'site-logs-table__summary-expanded': isExpanded,
				} ) }
				onClick={ () => setIsExpanded( ! isExpanded ) }
			>
				{ columns.map( ( column, index ) => (
					<td key={ column } className={ column }>
						{ index === 0 ? (
							<Badge className={ `badge--${ firstColumnValue }` }>
								{ formattedSeverities[ log[ column ] as keyof typeof formattedSeverities ] ??
									( log[ column ] as React.ReactNode ) }
							</Badge>
						) : (
							renderCell( column, log[ column ], moment, siteGmtOffset, locale )
						) }
					</td>
				) ) }
				<td className="chevron-cell">
					<div className="chevron-container">
						<Button
							borderless
							onClick={ () => setIsExpanded( ! isExpanded ) }
							compact
							aria-label={ __( 'Expand row' ) }
							aria-expanded={ isExpanded }
							aria-controls={ expandedId }
							className="site-metrics__chevron"
						>
							<Icon icon={ isExpanded ? chevronUp : chevronDown } />
						</Button>
					</div>
				</td>
			</tr>

			{ isExpanded && (
				<tr className="site-logs-table__table-row-expanded" id={ expandedId }>
					<td colSpan={ columns.length + 1 }>
						<SiteLogsExpandedContent log={ log } specifiedLogs={ specifiedLogs } />
					</td>
				</tr>
			) }
		</Fragment>
	);
}

function renderCell(
	column: string,
	value: unknown,
	moment: ReturnType< typeof useLocalizedMoment >,
	siteGmtOffset: number,
	locale: string
) {
	if ( value === null || value === undefined || value === '' ) {
		return <span className="site-logs-table__empty-cell" />;
	}

	if ( ( column === 'date' || column === 'timestamp' ) && typeof value === 'string' ) {
		const dateFormat = locale === 'en' ? 'll [at] h:mm A' : 'h:mm A, ll';
		const formattedDate = moment( value )
			.utcOffset( siteGmtOffset * 60 )
			.format( dateFormat );
		return <span>{ formattedDate }</span>;
	}

	if ( column === 'request_url' || column === 'message' ) {
		return <span>{ `${ value }` }</span>;
	}

	switch ( typeof value ) {
		case 'boolean':
			return value.toString();

		case 'number':
		case 'string':
			return value;

		default:
			JSON.stringify( value );
	}
}

import { Button } from '@automattic/components';
import { Icon, chevronDown, chevronUp } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import moment from 'moment';
import { Fragment, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { SiteLogsData } from 'calypso/data/hosting/use-site-logs-query';
import SiteLogsExpandedContent from './site-logs-expanded-content';
import './style.scss';

interface Props {
	columns: string[];
	log: SiteLogsData[ 'logs' ][ 0 ];
	siteGmtOffset: number;
}

export default function SiteLogsTableRow( { columns, log, siteGmtOffset }: Props ) {
	const { __ } = useI18n();
	const [ isExpanded, setIsExpanded ] = useState( false );
	const expandedId = useRef( uuidv4() ).current;

	return (
		<Fragment>
			<tr>
				{ columns.map( ( column ) => (
					<td key={ column }>{ renderCell( column, log[ column ], moment, siteGmtOffset ) }</td>
				) ) }
				<td>
					<Button
						borderless
						onClick={ () => setIsExpanded( ! isExpanded ) }
						compact
						aria-label={ __( 'Expand row' ) }
						aria-expanded={ isExpanded }
						aria-controls={ expandedId }
					>
						<Icon icon={ isExpanded ? chevronUp : chevronDown } />
					</Button>
				</td>
			</tr>

			{ isExpanded && (
				<tr className="site-logs-table__table-row-expanded" id={ expandedId }>
					<td colSpan={ columns.length + 1 }>
						<SiteLogsExpandedContent log={ log } />
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
	siteGmtOffset: number
) {
	if ( value === null || value === undefined || value === '' ) {
		return <span className="site-logs-table__empty-cell" />;
	}

	if ( ( column === 'date' || column === 'timestamp' ) && typeof value === 'string' ) {
		return moment( value )
			.utcOffset( siteGmtOffset * 60 )
			.format( 'll @ HH:mm:ss.SSS Z' );
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

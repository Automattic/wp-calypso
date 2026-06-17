import { __experimentalText as Text, __experimentalVStack as VStack } from '@wordpress/components';
import { dateI18n } from '@wordpress/date';
import { __ } from '@wordpress/i18n';
import { MODE_LABELS, STATUS_LABELS } from './types';
import type { AmplifyReportRow, AmplifyRowStatus } from './types';
import type { Field, Operator } from '@wordpress/dataviews';

function scoreLabel( row: AmplifyReportRow ): string {
	if ( row.status !== 'completed' || ! row.score ) {
		return '—';
	}
	const parts: string[] = [];
	if ( row.score.human !== null ) {
		parts.push( `${ __( 'Human' ) } ${ row.score.human }` );
	}
	if ( row.score.ai !== null ) {
		parts.push( `${ __( 'AI' ) } ${ row.score.ai }` );
	}
	return parts.length ? parts.join( ' · ' ) : '—';
}

export function useReportFields(): Field< AmplifyReportRow >[] {
	return [
		{
			id: 'site',
			label: __( 'Site' ),
			enableHiding: false,
			enableSorting: true,
			enableGlobalSearch: true,
			getValue: ( { item } ) => `${ item.agencyName ?? '' } ${ item.url }`.trim(),
			render: ( { item } ) => (
				<VStack spacing={ 0 }>
					{ item.agencyName && <Text weight={ 500 }>{ item.agencyName }</Text> }
					<Text variant="muted" size={ 12 }>
						{ item.url }
					</Text>
				</VStack>
			),
		},
		{
			id: 'mode',
			label: __( 'Analysis type' ),
			enableSorting: true,
			elements: ( Object.keys( MODE_LABELS ) as Array< keyof typeof MODE_LABELS > ).map(
				( value ) => ( { value, label: MODE_LABELS[ value ] } )
			),
			filterBy: { operators: [ 'isAny' as Operator ] },
			getValue: ( { item } ) => item.mode,
			render: ( { item } ) => <Text>{ MODE_LABELS[ item.mode ] }</Text>,
		},
		{
			id: 'status',
			label: __( 'Status' ),
			enableSorting: true,
			elements: ( Object.keys( STATUS_LABELS ) as AmplifyRowStatus[] ).map( ( value ) => ( {
				value,
				label: STATUS_LABELS[ value ],
			} ) ),
			filterBy: { operators: [ 'isAny' as Operator ] },
			getValue: ( { item } ) => item.status,
			render: ( { item } ) => (
				<Text>
					{ item.status === 'failed' && item.failureReason
						? item.failureReason
						: STATUS_LABELS[ item.status ] }
				</Text>
			),
		},
		{
			id: 'score',
			label: __( 'Scores' ),
			enableSorting: false,
			enableGlobalSearch: false,
			getValue: ( { item } ) => scoreLabel( item ),
			render: ( { item } ) => <Text>{ scoreLabel( item ) }</Text>,
		},
		{
			id: 'timestamp',
			label: __( 'Date' ),
			enableSorting: true,
			enableGlobalSearch: false,
			getValue: ( { item } ) => item.timestamp,
			render: ( { item } ) => <Text>{ dateI18n( 'F j, Y, g:i a', item.timestamp ) }</Text>,
		},
	];
}

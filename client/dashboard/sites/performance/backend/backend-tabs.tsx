import { __experimentalVStack as VStack, privateApis } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import { Text } from '../../../components/text';
import { VIEWPORT_BREAKPOINTS } from '../constants';
import { BACKEND_THRESHOLDS_MS, bucketByMs, formatMs, type Intent } from './utils';
import type { ApmTab } from '.';
import type { ApmSummary } from '@automattic/api-core';

const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
	'@wordpress/components'
);

const { Tabs } = unlock( privateApis );

function formatCount( value: number ): string {
	return new Intl.NumberFormat().format( value );
}

function Tab( {
	tabId,
	label,
	value,
	intent,
}: {
	tabId: ApmTab;
	label: string;
	value: string;
	intent?: Intent;
} ) {
	const isDesktop = useViewportMatch( VIEWPORT_BREAKPOINTS.desktop );

	return (
		<Tabs.Tab tabId={ tabId } style={ { height: '100%' } }>
			<VStack alignment={ isDesktop ? 'flex-start' : 'center' } spacing={ 0 }>
				<Text size={ 11 } lineHeight="24px" upperCase variant="muted">
					{ label }
				</Text>
				<Text size={ 16 } weight={ 500 } lineHeight="32px" intent={ intent }>
					{ value }
				</Text>
			</VStack>
		</Tabs.Tab>
	);
}

export default function BackendTabs( {
	summary,
	compact,
}: {
	summary: ApmSummary;
	compact?: boolean;
} ) {
	const items: Array< {
		tabId: ApmTab;
		label: string;
		value: string;
		intent?: Intent;
	} > = [
		{
			tabId: 'overview',
			label: compact ? __( 'Avg' ) : __( 'Avg response' ),
			value: formatMs( summary.avg_response_ms ),
			intent: bucketByMs( summary.avg_response_ms, BACKEND_THRESHOLDS_MS.response ),
		},
		{
			tabId: 'transactions',
			label: __( 'Transactions' ),
			value: formatCount( summary.transaction_count ),
		},
		{
			tabId: 'wordpress',
			label: compact ? __( 'WP' ) : __( 'WordPress' ),
			value: formatMs( summary.plugins_avg_ms ),
			intent: bucketByMs( summary.plugins_avg_ms, BACKEND_THRESHOLDS_MS.plugins ),
		},
		{
			tabId: 'database',
			label: compact ? __( 'DB' ) : __( 'Database' ),
			value: formatMs( summary.db_avg_ms ),
			intent: bucketByMs( summary.db_avg_ms, BACKEND_THRESHOLDS_MS.db ),
		},
		{
			tabId: 'external-requests',
			label: __( 'External' ),
			value: formatMs( summary.external_avg_ms ),
			intent: bucketByMs( summary.external_avg_ms, BACKEND_THRESHOLDS_MS.external ),
		},
	];

	return (
		<Tabs.TabList style={ { maxWidth: '100%' } }>
			{ items.map( ( item ) => (
				<Tab
					key={ item.tabId }
					tabId={ item.tabId }
					label={ item.label }
					value={ item.value }
					intent={ item.intent }
				/>
			) ) }
		</Tabs.TabList>
	);
}

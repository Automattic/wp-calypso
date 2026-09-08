import {
	Button,
	Card,
	CardBody,
	CardFooter,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { bell } from '@wordpress/icons';
import A4AEmptyState from 'calypso/a8c-for-agencies/components/a4a-empty-state';
import DocumentHead from 'calypso/components/data/document-head';
import { useToggleActivateMonitor } from 'calypso/jetpack-cloud/sections/agency-dashboard/hooks';
import MonitorActivity from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-expanded-content/monitor-activity';
import { useSelector } from 'calypso/state';
import { getSiteMonitorStatuses } from 'calypso/state/jetpack-agency-dashboard/selectors';
import { Site } from '../../types';

type Props = {
	site: Site;
	trackEvent: ( eventName: string ) => void;
	hasError?: boolean;
};

function MonitorLegend() {
	const items = [
		{ key: 'uptime', label: __( 'Uptime' ) },
		{ key: 'downtime', label: __( 'Downtime' ) },
		{ key: 'no-data', label: __( 'No data' ) },
	];

	return (
		<HStack spacing={ 4 } justify="flex-start" wrap>
			{ items.map( ( { key, label } ) => (
				<HStack key={ key } spacing={ 2 } expanded={ false }>
					<span
						className={ `site-preview-pane__monitor-legend-swatch is-${ key }` }
						aria-hidden="true"
					/>
					<Text variant="muted">{ label }</Text>
				</HStack>
			) ) }
		</HStack>
	);
}

export function JetpackMonitorPreview( { site, trackEvent, hasError = false }: Props ) {
	const hasMonitor = site.monitor_settings.monitor_active;
	const toggleActivateMonitor = useToggleActivateMonitor( [ site ] );
	const statuses = useSelector( getSiteMonitorStatuses );
	const isActivating = statuses?.[ site.blog_id ] === 'loading';

	const handleActivate = () => {
		trackEvent( 'monitor_preview_activate_monitor_click' );
		toggleActivateMonitor( true );
	};

	return (
		<>
			<DocumentHead title="Monitor" />
			<div className="site-preview-pane__monitor-content">
				{ ! hasMonitor && ! hasError ? (
					<A4AEmptyState
						icon={ bell }
						title={ __( 'Monitor is not active' ) }
						description={ __(
							'Monitor checks this site regularly and notifies you if it goes down. Activate it to start recording uptime here.'
						) }
					>
						<Button
							variant="primary"
							onClick={ handleActivate }
							isBusy={ isActivating }
							disabled={ isActivating }
						>
							{ __( 'Activate Monitor' ) }
						</Button>
					</A4AEmptyState>
				) : (
					<Card>
						<CardBody>
							<MonitorActivity
								hasMonitor={ hasMonitor }
								site={ site }
								trackEvent={ trackEvent }
								hasError={ hasError }
							/>
						</CardBody>
						{ hasMonitor && (
							<CardFooter justify="flex-start">
								<MonitorLegend />
							</CardFooter>
						) }
					</Card>
				) }
			</div>
		</>
	);
}

import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { useMutationState } from '@tanstack/react-query';
import {
	__experimentalText as Text,
	Button,
	Icon,
	Card,
	CardHeader,
	CardBody,
	CardFooter,
} from '@wordpress/components';
import { info, arrowLeft } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { Banner } from 'calypso/components/banner';
import { scrollToTop } from '../plugin-scheduled-updates-common/utils';
import { useCanCreateSchedules } from './hooks/use-can-create-schedules';
import { useCreateMonitor } from './hooks/use-create-monitor';
import { useIsEligibleForFeature } from './hooks/use-is-eligible-for-feature';
import { useSiteHasEligiblePlugins } from './hooks/use-site-has-eligible-plugins';
import { useSiteSlug } from './hooks/use-site-slug';
import { ScheduleForm } from './schedule-form';
import type { SyncSuccessParams } from './types';

interface Props {
	onNavBack?: () => void;
}
export const ScheduleCreate = ( props: Props ) => {
	const siteSlug = useSiteSlug();
	const translate = useTranslate();
	const { createMonitor } = useCreateMonitor( siteSlug );
	const { isEligibleForFeature } = useIsEligibleForFeature();
	const { siteHasEligiblePlugins, loading: siteHasEligiblePluginsLoading } =
		useSiteHasEligiblePlugins();
	const { onNavBack } = props;
	const { canCreateSchedules, errors: eligibilityCheckErrors } = useCanCreateSchedules(
		siteSlug,
		isEligibleForFeature
	);
	const pendingMutations = useMutationState( {
		filters: { mutationKey: [ 'create-update-schedule', siteSlug ], status: 'pending' },
	} );
	const isBusy = pendingMutations.length > 0;
	const [ syncError, setSyncError ] = useState( '' );

	// Redirect back to list when no eligible plugins are installed
	useEffect( () => {
		if ( ! siteHasEligiblePlugins && ! siteHasEligiblePluginsLoading ) {
			onNavBack && onNavBack();
		}
	}, [ siteHasEligiblePlugins, siteHasEligiblePluginsLoading ] );

	const onSyncSuccess = ( params: SyncSuccessParams ) => {
		recordTracksEvent( 'calypso_scheduled_updates_create_schedule', {
			site_slug: siteSlug,
			frequency: params.frequency,
			plugins_number: params.plugins.length,
			hours: params.hours,
			weekday: params.weekday,
		} );

		createMonitor();
		setSyncError( '' );
		scrollToTop();

		return onNavBack && onNavBack();
	};

	return (
		<>
			{ ! siteHasEligiblePlugins && (
				<Banner
					title={ translate( 'No plugins to update' ) }
					description={ translate(
						'You don’t have any plugins that can be updated. Visit the {{a}}Plugins{{/a}} section to explore and install new plugins.',
						{
							components: {
								a: <a href={ `/plugins/${ siteSlug }` } />,
							},
						}
					) }
					onClick={ () => {
						page.show( `/plugins/${ siteSlug }` );
					} }
				/>
			) }
			<Card className="plugins-update-manager">
				<CardHeader size="extraSmall">
					<div className="ch-placeholder">
						{ onNavBack && (
							<Button icon={ arrowLeft } onClick={ onNavBack }>
								{ translate( 'Back' ) }
							</Button>
						) }
					</div>
					<Text>{ translate( 'New Schedule' ) }</Text>
					<div className="ch-placeholder"></div>
				</CardHeader>
				<CardBody>
					<ScheduleForm onSyncSuccess={ onSyncSuccess } onSyncError={ setSyncError } />
				</CardBody>
				<CardFooter>
					<Button
						form="schedule"
						type="submit"
						variant={ canCreateSchedules ? 'primary' : 'secondary' }
						disabled={ ! canCreateSchedules || ! siteHasEligiblePlugins }
						isBusy={ isBusy }
						className="schedule-form-button"
					>
						{ translate( 'Create' ) }
					</Button>
					{ ( ( ! canCreateSchedules && eligibilityCheckErrors?.length ) || syncError ) && (
						<Text as="p" className="validation-msg">
							<Icon className="icon-info" icon={ info } size={ 16 } />
							{ ( eligibilityCheckErrors?.length && eligibilityCheckErrors[ 0 ].message ) || '' }
							{ syncError }
						</Text>
					) }
				</CardFooter>
			</Card>
		</>
	);
};

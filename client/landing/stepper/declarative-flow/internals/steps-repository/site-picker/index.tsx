import { StepContainer } from '@automattic/onboarding';
import {
	DEFAULT_SITE_LAUNCH_STATUS_GROUP_VALUE,
	GroupableSiteLaunchStatuses,
} from '@automattic/sites';
import { useI18n } from '@wordpress/react-i18n';
import React from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { SitesDashboardQueryParams } from 'calypso/sites-dashboard/components/sites-content-controls';
import SitePicker from './site-picker';
import type { Step } from '../../types';

import './styles.scss';

const SitePickerStep: Step = function SitePickerStep( { navigation } ) {
	const { __ } = useI18n();
	const headerText = __( 'Pick your destination' );
	const page = Number( useQuery().get( 'page' ) ) || 1;
	const search = useQuery().get( 'search' ) || '';
	const status =
		( useQuery().get( 'status' ) as GroupableSiteLaunchStatuses ) ||
		DEFAULT_SITE_LAUNCH_STATUS_GROUP_VALUE;

	const onQueryParamChange = ( params: Partial< SitesDashboardQueryParams > ) => {
		navigation.submit?.( { action: 'update-query', queryParams: params } );
	};

	const createNewSite = () => {
		navigation.submit?.( { action: 'create-site' } );
	};

	return (
		<>
			<DocumentHead title={ headerText } />
			<StepContainer
				stepName="site-picker"
				hideBack={ true }
				hideSkip={ false }
				skipLabelText={ __( 'Skip and create a new site' ) }
				goNext={ createNewSite }
				stepContent={
					<SitePicker
						page={ page }
						search={ search }
						status={ status }
						onCreateSiteClick={ createNewSite }
						onQueryParamChange={ onQueryParamChange }
					/>
				}
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default SitePickerStep;

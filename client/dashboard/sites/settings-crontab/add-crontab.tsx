import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import Breadcrumbs from '../../app/breadcrumbs';
import {
	siteRoute,
	siteSettingsCrontabAddRoute,
	siteSettingsCrontabRoute,
} from '../../app/router/sites';
import { Card, CardBody } from '../../components/card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { AddCrontabForm } from './add-crontab-form';

export default function AddCrontab() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const navigateFrom = siteSettingsCrontabAddRoute.fullPath;
	const navigate = useNavigate( { from: navigateFrom } );

	const handleCancel = () => {
		navigate( {
			to: siteSettingsCrontabRoute.fullPath,
			params: { siteSlug },
		} );
	};

	const handleSuccess = () => {
		navigate( {
			to: siteSettingsCrontabRoute.fullPath,
			params: { siteSlug },
		} );
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 3 } /> }
					title={ __( 'Add Scheduled Job' ) }
					description={ __(
						'Schedule a command to run automatically at specified intervals on your site.'
					) }
				/>
			}
		>
			<Card>
				<CardBody>
					<AddCrontabForm
						siteId={ site.ID }
						onSuccess={ handleSuccess }
						onCancel={ handleCancel }
					/>
				</CardBody>
			</Card>
		</PageLayout>
	);
}

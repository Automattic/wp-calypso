import { siteBySlugQuery, siteCrontabsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from '@tanstack/react-router';
import { siteSettingsCrontabEditRoute, siteSettingsCrontabRoute } from '../../app/router/sites';
import CrontabForm from './crontab-form';

export default function EditCrontab() {
	const { siteSlug, cronId } = useParams( { strict: false } ) as {
		siteSlug: string;
		cronId: number;
	};
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const navigate = useNavigate( { from: siteSettingsCrontabEditRoute.fullPath } );

	// Data is preloaded by the route loader
	const { data: crontabs = [] } = useSuspenseQuery( siteCrontabsQuery( site.ID ) );
	const crontab = crontabs.find( ( c ) => c.cron_id === Number( cronId ) );

	// If crontab not found, redirect back to list
	if ( ! crontab ) {
		navigate( {
			to: siteSettingsCrontabRoute.fullPath,
			params: { siteSlug },
		} );
		return null;
	}

	return <CrontabForm crontab={ crontab } />;
}

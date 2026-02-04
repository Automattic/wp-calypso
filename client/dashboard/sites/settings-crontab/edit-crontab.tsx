import { siteSettingsCrontabEditRoute } from '../../app/router/sites';
import CrontabForm from './crontab-form';

export default function EditCrontab() {
	const { cronId } = siteSettingsCrontabEditRoute.useParams();

	return <CrontabForm cronId={ Number( cronId ) } />;
}

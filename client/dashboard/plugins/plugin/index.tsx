import { pluginRoute } from '../../app/router/plugins';

export default function Plugin() {
	const { pluginId } = pluginRoute.useParams();

	return <div>Plugin { pluginId }</div>;
}

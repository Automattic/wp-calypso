import Plans from './plans';
import PluginUpload from './plugin-upload';

export function upload( context, next ) {
	context.primary = <PluginUpload />;
	next();
}

export function plans( context, next ) {
	context.primary = (
		<Plans
			intervalType={ context.params.intervalType }
			pluginSlug={ context.params.pluginSlug || false }
		/>
	);
	next();
}

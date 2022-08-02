import PluginUpload from './plugin-upload';

export function upload( context, next ) {
	context.primary = <PluginUpload />;
	next();
}

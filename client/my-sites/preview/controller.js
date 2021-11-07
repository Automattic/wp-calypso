import PreviewMain from './main';

export function preview( context, next ) {
	context.primary = <PreviewMain site={ context.params.site } />;
	next();
}

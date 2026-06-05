import Read295Poc from './';

export function read295PocList( context, next ) {
	context.primary = <Read295Poc />;
	next();
}

export function read295PocPost( context, next ) {
	context.primary = (
		<Read295Poc
			sourceType={ context.params.sourceType }
			sourceId={ context.params.sourceId }
			postId={ context.params.post }
		/>
	);
	next();
}

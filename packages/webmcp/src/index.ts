export type WebMcpTool = {
	name: string;
	title?: string;
	description: string;
	inputSchema?: Record< string, unknown >;
	annotations?: Record< string, unknown >;
	execute: (
		input: Record< string, unknown >,
		options?: { signal?: AbortSignal; [ key: string ]: unknown }
	) => unknown | Promise< unknown >;
};

export type WebMcpModelContext = {
	registerTool: ( tool: WebMcpTool, options?: { signal?: AbortSignal } ) => void | Promise< void >;
};

export type WebMcpToolRegistry = {
	sync: () => Promise< void >;
	dispose: () => void;
};

type ModelContextHost = { modelContext?: unknown };

export function getWebMcpModelContext(
	documentHost: ModelContextHost | undefined = typeof document === 'undefined'
		? undefined
		: ( document as ModelContextHost ),
	navigatorHost: ModelContextHost | undefined = typeof navigator === 'undefined'
		? undefined
		: ( navigator as ModelContextHost )
): WebMcpModelContext | undefined {
	for ( const host of [ documentHost, navigatorHost ] ) {
		try {
			const context = host?.modelContext as WebMcpModelContext | undefined;
			if ( context && typeof context.registerTool === 'function' ) {
				return context;
			}
		} catch {
			// A browser may expose the API but deny access in this context.
		}
	}
	return undefined;
}

type Registration = {
	controller: AbortController;
	fingerprint: string;
	tool: WebMcpTool;
};

export function createWebMcpToolRegistry( {
	modelContext,
	getTools,
}: {
	modelContext: WebMcpModelContext;
	getTools: () => WebMcpTool[] | Promise< WebMcpTool[] >;
} ): WebMcpToolRegistry {
	const registrations = new Map< string, Registration >();
	const pendingControllers = new Set< AbortController >();
	let disposed = false;
	let syncRequested = false;
	let syncQueue = Promise.resolve();

	const reconcile = async () => {
		const tools = await getTools();
		if ( disposed ) {
			return;
		}

		const eligible = new Map( tools.map( ( tool ) => [ tool.name, tool ] ) );
		for ( const [ name, registration ] of registrations ) {
			if ( ! eligible.has( name ) ) {
				registration.controller.abort();
				registrations.delete( name );
			}
		}

		const errors: unknown[] = [];
		for ( const [ name, tool ] of eligible ) {
			if ( disposed ) {
				break;
			}

			const controller = new AbortController();
			try {
				const { execute: _execute, ...descriptor } = tool;
				const fingerprint = JSON.stringify( descriptor );
				const current = registrations.get( name );
				if ( current?.fingerprint === fingerprint ) {
					current.tool = tool;
					continue;
				}

				current?.controller.abort();
				registrations.delete( name );
				const registration = { controller, fingerprint, tool };
				pendingControllers.add( controller );
				await modelContext.registerTool(
					{
						...tool,
						execute: async ( input, options ) => {
							if ( disposed || controller.signal.aborted || options?.signal?.aborted ) {
								throw new DOMException( 'WebMCP tool execution was aborted.', 'AbortError' );
							}
							return registration.tool.execute( input, options );
						},
					},
					{ signal: controller.signal }
				);
				if ( ! disposed ) {
					registrations.set( name, registration );
				}
			} catch ( error ) {
				controller.abort();
				errors.push( error );
			} finally {
				pendingControllers.delete( controller );
			}
		}

		if ( errors.length ) {
			throw errors[ 0 ];
		}
	};

	return {
		sync: () => {
			if ( disposed ) {
				return Promise.resolve();
			}
			syncRequested = true;
			const result = syncQueue.then( async () => {
				while ( syncRequested && ! disposed ) {
					syncRequested = false;
					await reconcile();
				}
			} );
			syncQueue = result.catch( () => {} );
			return result;
		},
		dispose: () => {
			disposed = true;
			syncRequested = false;
			for ( const controller of pendingControllers ) {
				controller.abort();
			}
			pendingControllers.clear();
			for ( const registration of registrations.values() ) {
				registration.controller.abort();
			}
			registrations.clear();
		},
	};
}

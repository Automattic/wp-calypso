export default ( query ) => ( {
	isWooDnaFlow: () => Boolean( query.woodna_service_name ),
	getServiceSlug: () => query.from,
	getFlowName: () => 'woodna:' + query.from,
	getServiceName: () => query.woodna_service_name,
	getServiceHelpUrl: () => query.woodna_help_url,
} );

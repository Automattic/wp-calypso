export const getClientTools = ( addMessage?: ( message: any ) => void ) => {
	return {
		getAvailableTools: async () => [
			{
				id: 'display_graph',
				name: 'Sales Graph Display',
				description:
					'Displays a sales graph for products with interactive visualization. Use when users ask to see sales data, product performance, or graphical representations of sales metrics. Just make up random data',
				input_schema: {
					type: 'object',
					properties: {
						title: {
							type: 'string',
							description:
								'The title for the graph (e.g., "Top 5 Products by Sales")',
						},
						timeframe: {
							type: 'string',
							description:
								'Optional timeframe description (e.g., "Last 30 days", "Q3 2024")',
						},
						data: {
							type: 'array',
							description: 'Array of sales data for products',
							items: {
								type: 'object',
								properties: {
									product: {
										type: 'string',
										description: 'Product name',
									},
									sales: {
										type: 'number',
										description:
											'Number of sales/units sold',
									},
								},
								required: [ 'product', 'sales' ],
							},
						},
					},
					required: [ 'title', 'data' ],
				},
			},
		],
		executeTool: async (
			toolId: string,
			args: any,
			messageId: string,
			toolCallId: string
		) => {
			console.log( `Executing tool: ${ toolId }`, {
				args,
				messageId,
				toolCallId,
			} );

			switch ( toolId ) {
				case 'display_graph':
					if ( ! args.title || ! args.data ) {
						return {
							result: 'Error: Title and data are required for graph display',
							returnToAgent: true,
						};
					}

					// Add a component message if addMessage is available
					if ( addMessage ) {
						const { MockSalesGraph } = await import(
							'./MockSalesGraph'
						);
						addMessage( {
							id: crypto.randomUUID(),
							role: 'assistant',
							content: [
								{
									type: 'component',
									component: MockSalesGraph,
									componentProps: {
										title: args.title,
										data: args.data,
										timeframe: args.timeframe,
									},
								},
							],
							created_at: Date.now(),
							archived: false,
							showIcon: true,
						} );
					}

					return {
						result: `Graph displayed: ${ args.title } with ${ args.data.length } data points`,
						returnToAgent: false,
					};
			}
		},
	};
};

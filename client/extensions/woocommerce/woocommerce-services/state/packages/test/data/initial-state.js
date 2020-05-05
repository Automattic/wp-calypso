export default {
	showModal: false,
	packageData: null,
	packages: {
		custom: [ { name: '1' }, { name: '2' }, { name: 'zBox' } ],
		predefined: { service: [ 'box', 'box1' ], otherService: [ 'envelope' ] },
	},
	predefinedSchema: {
		service: {
			priority: {
				definitions: [
					{ id: 'box', name: 'bBox', can_ship_international: true },
					{ id: 'box1', name: 'aBox', can_ship_international: false },
					{ id: 'box2', name: 'cBox', can_ship_international: true },
				],
				title: 'Priority',
			},
		},
		otherService: {
			express: {
				definitions: [ { id: 'envelope', name: 'envelope', can_ship_international: false } ],
				title: 'Express',
			},
		},
	},
	pristine: true,
	isSaving: false,
};

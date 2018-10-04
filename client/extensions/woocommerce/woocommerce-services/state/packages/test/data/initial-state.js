/** @format */
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
					{ id: 'box', name: 'bBox' },
					{ id: 'box1', name: 'aBox' },
					{ id: 'box2', name: 'cBox' },
				],
				title: 'Priority',
			},
		},
		otherService: {
			express: {
				definitions: [ { id: 'envelope', name: 'envelope' } ],
				title: 'Express',
			},
		},
	},
	pristine: true,
	isSaving: false,
};

module.exports = {
	rules: {
		'no-restricted-properties': [
			'warn',
			{
				object: 'document',
				property: 'querySelector',
				message:
					'The Help Center runs inside a shadow root; its elements are not queryable on the document level. Please use React references instead.',
			},
		],
	},
};

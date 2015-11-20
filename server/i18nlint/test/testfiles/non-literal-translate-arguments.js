var stringVariable = 'Strings for translation must be a literal',
	contextVariable = 'Can not be a variable.',
	commentVariable = 'Not ok.',
	argsWithContext = { context: 'translate() args need to be literal too' },
	argsWithComment = { comment: 'If they have a comment or context' };

var translate = function() {}; // Hi there, eslint!

translate( stringVariable );
translate( 'Plural must be literal too', stringVariable, { count: 12 } );
translate( 'context must be a string literal.',
	{
		comment: 'a nice, literal comment',
		context: contextVariable
	} );

translate( 'comment must be a string literal.',
	{ comment: commentVariable } );

translate( 'options containing a comment must be an object literal.',
	argsWithComment );
translate( 'options containing a context must be an object literal.', argsWithContext );
translate( 'string literal keys are ok', { 'context': contextVariable } );
translate( 'string literal keys are ok', { 'comment': commentVariable } );

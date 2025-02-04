import clsx from 'clsx';

const save = ( { attributes } ) => {
	const { checked, content, className } = attributes;
	const todoClass = clsx( 'wp-block-todo', className, { 'is-checked': checked } );

	return (
		<div className={ todoClass }>
			{ checked ? '✅' : '⬜' }
			<p>{ content }</p>
		</div>
	);
};

export default save;

/**
 * External dependencies
 */
import React, { useState } from 'react';

/**
 * WordPress dependencies
 */
import { TreeSelect } from '@wordpress/components';

const TreeSelectExample = () => {
	const [ selection, setSelection ] = useState( '' );

	return (
		<TreeSelect
			label="Hidable label text"
			noOptionLabel="No parent page"
			help="Help text to explain the select control."
			tree={ [
				{
					name: 'Page 1',
					id: 'p1',
					children: [
						{ name: 'Descend 1 of page 1', id: 'p11' },
						{ name: 'Descend 2 of page 1', id: 'p12' },
					],
				},
				{
					name: 'Page 2',
					id: 'p2',
					children: [
						{
							name: 'Descend 1 of page 2',
							id: 'p21',
							children: [
								{
									name: 'Descend 1 of Descend 1 of page 2',
									id: 'p211',
								},
							],
						},
					],
				},
			] }
			onChange={ setSelection }
			selectedId={ selection }
		/>
	);
};

export default TreeSelectExample;

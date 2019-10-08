/**
 * External dependencies
 */
import React, { useState } from 'react';

import { Header } from '@wordpress/edit-post';
import { SelectControl } from '@wordpress/components';
import Main from 'components/main';

export function CreateSite() {
	const [ siteType, setSiteType ] = useState( 'blog' );

	return (
		<>
			<Header />
			<Main>
				I want to create a <u>website</u>
				<SelectControl
					value={ siteType }
					onChange={ setSiteType as ( nextState: string ) => void }
					options={ [
						{ label: 'with a blog', value: 'blog' },
						{ label: 'for a store', value: 'store' },
						{ label: 'to write a story', value: 'story' },
					] }
				/>
				.
			</Main>
		</>
	);
}

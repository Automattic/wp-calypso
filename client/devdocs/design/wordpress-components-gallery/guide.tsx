/**
 * External dependencies
 */
import React, { useState } from 'react';
import { times } from 'lodash';

/**
 * WordPress dependencies
 */
import { Button, Guide } from '@wordpress/components';

const GuideExample = () => {
	const numberOfPages = 5;
	const [ isOpen, setOpen ] = useState( false );

	const openGuide = () => setOpen( true );
	const closeGuide = () => setOpen( false );

	const loremIpsum =
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

	return (
		<>
			<Button isSecondary onClick={ openGuide }>
				Open Guide
			</Button>
			{ isOpen && (
				<Guide
					finishButtonText="Finish"
					contentLabel="Guide title"
					onFinish={ closeGuide }
					pages={ times( numberOfPages, ( page ) => ( {
						content: (
							<>
								<h1>
									Page { page + 1 } of { numberOfPages }
								</h1>
								<p>{ loremIpsum }</p>
							</>
						),
					} ) ) }
				/>
			) }
		</>
	);
};

export default GuideExample;

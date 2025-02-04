import { useState, useEffect } from 'react';

// The blocks should be registered only one time, so use it to avoid multiple registration.
let blocksRegistered = false;

const useRegisterCoreBlocks = () => {
	const [ isBlocksRegistered, setIsBlocksRegistered ] = useState( blocksRegistered );

	useEffect( () => {
		if ( blocksRegistered ) {
			return;
		}

		// The block-level styles have effects only when the specific blocks are registered so we have to register core blocks.
		// See https://github.com/WordPress/gutenberg/blob/16486bd946f918d581e4818b73ceaaed82349f71/packages/block-editor/src/components/global-styles/use-global-styles-output.js#L1190
		import( '@wordpress/block-library' )
			.then( ( { registerCoreBlocks }: typeof import('@wordpress/block-library') ) =>
				registerCoreBlocks()
			)
			.then( () => {
				blocksRegistered = true;
				setIsBlocksRegistered( true );
			} );
	}, [] );

	return isBlocksRegistered;
};

export default useRegisterCoreBlocks;

/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React, { useState, useCallback, FunctionComponent, ReactNode } from 'react';

/**
 * Internal dependencies
 */
import FoldableCard from 'components/foldable-card';

interface Props {
	features: ReactNode;
}

const JetpackProductCardFeatures: FunctionComponent< Props > = ( { features } ) => {
	const [ isExpanded, setExpanded ] = useState( false );
	const onOpen = useCallback( () => setExpanded( true ), [ setExpanded ] );
	const onClose = useCallback( () => setExpanded( false ), [ setExpanded ] );
	const translate = useTranslate();

	return (
		<FoldableCard
			header={ isExpanded ? translate( 'Hide features' ) : translate( 'Show features' ) }
			clickableHeader
			onOpen={ onOpen }
			onClose={ onClose }
		>
			{ features }
		</FoldableCard>
	);
};

export default JetpackProductCardFeatures;

/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React, { useState, useCallback, FunctionComponent, ReactNode } from 'react';

/**
 * Internal dependencies
 */
import FoldableCard from 'components/foldable-card';

export type Props = {
	features: ReactNode;
	isExpanded?: boolean;
};

const JetpackProductCardFeatures: FunctionComponent< Props > = ( {
	features,
	isExpanded: isExpandedByDefault,
} ) => {
	const [ isExpanded, setExpanded ] = useState( !! isExpandedByDefault );
	const onOpen = useCallback( () => setExpanded( true ), [ setExpanded ] );
	const onClose = useCallback( () => setExpanded( false ), [ setExpanded ] );
	const translate = useTranslate();

	return (
		<FoldableCard
			header={ isExpanded ? translate( 'Hide features' ) : translate( 'Show features' ) }
			clickableHeader
			expanded={ isExpanded }
			onOpen={ onOpen }
			onClose={ onClose }
		>
			{ features }
		</FoldableCard>
	);
};

export default JetpackProductCardFeatures;

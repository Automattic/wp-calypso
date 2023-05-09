import { forwardRef } from 'react';
import Card from '.';
import type { Props, TagName } from '.';
import type { Ref } from 'react';

const CompactCard = forwardRef(
	< T extends TagName >( props: Omit< Props< T >, 'compact' >, ref: Ref< unknown > ) => (
		<Card { ...( props as Props< T > ) } compact ref={ ref } />
	)
);
CompactCard.displayName = 'CompactCard';

export default CompactCard;

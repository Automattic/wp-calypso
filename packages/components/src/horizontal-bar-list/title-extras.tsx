import React from 'react';
import BadgeNew from './sideElements/badge-new';

type TitleExtrasProps = {
	isNew?: boolean;
	prefixNodes?: React.ReactNode;
	children?: React.ReactNode;
};

const TitleExtras: React.FC< TitleExtrasProps > = ( { isNew, prefixNodes, children } ) => {
	return (
		<>
			{ prefixNodes }
			{ isNew && <BadgeNew /> }
			{ children }
		</>
	);
};

export default TitleExtras;

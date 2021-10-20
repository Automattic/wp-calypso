import { localize, LocalizeProps } from 'i18n-calypso';
import React from 'react';
import { write, design } from '../../icons';
import SelectItems, { SelectItem } from '../../select-items';
import type { StartingPointFlag } from './types';

type StartingPointConfig = SelectItem< StartingPointFlag >;

interface Props {
	onSelect: ( startingPoint: StartingPointFlag ) => void;
	translate: LocalizeProps[ 'translate' ];
}

const useStartingPoints = ( { translate }: Pick< Props, 'translate' > ): StartingPointConfig[] => {
	return [
		{
			key: 'write',
			title: translate( 'Draft your first post' ),
			description: translate( 'Start writing and build an audience' ),
			icon: write,
			value: 'write',
			actionText: translate( 'Start writing' ),
		},
		{
			key: 'design',
			title: translate( 'Choose a design' ),
			description: translate( 'Make your blog feel like home' ),
			icon: design,
			value: 'design',
			actionText: translate( 'View designs' ),
		},
	];
};

const StartingPoint: React.FC< Props > = ( { onSelect, translate } ) => {
	const startingPoints = useStartingPoints( { translate } );

	return <SelectItems items={ startingPoints } onSelect={ onSelect } />;
};

export default localize( StartingPoint );

import { isEnabled } from '@automattic/calypso-config';
import { SelectItems, SelectItem } from '@automattic/intent-screen';
import { localize, LocalizeProps } from 'i18n-calypso';
import React from 'react';
import { preventWidows } from 'calypso/lib/formatting';
import { write, play, design } from '../../icons';
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
			description: <p>{ translate( 'Start writing and build an audience' ) }</p>,
			icon: write,
			value: 'write',
			actionText: translate( 'Start writing' ),
		},
		{
			key: 'courses',
			title: translate( 'Watch Blogging videos' ),
			description: <p>{ translate( ' Learn the blogging basics in minutes ' ) }</p>,
			icon: play,
			value: 'courses',
			actionText: translate( 'Start learning' ),
			hidden: ! isEnabled( 'signup/starting-point-courses' ),
		},
		{
			key: 'design',
			title: translate( 'Choose a design' ),
			description: <p>{ translate( 'Make your blog feel like home' ) }</p>,
			icon: design,
			value: 'design',
			actionText: translate( 'View designs' ),
		},
	];
};

const StartingPoint: React.FC< Props > = ( { onSelect, translate } ) => {
	const startingPoints = useStartingPoints( { translate } );

	return (
		<SelectItems
			items={ startingPoints.filter( ( { hidden } ) => ! hidden ) }
			onSelect={ onSelect }
			preventWidows={ preventWidows }
		/>
	);
};

export default localize( StartingPoint );

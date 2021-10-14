import { Button } from '@automattic/components';
import { Icon } from '@wordpress/icons';
import { localize, LocalizeProps, TranslateResult } from 'i18n-calypso';
import React from 'react';
import { write, design } from '../../icons';
import type { StartingPointFlag } from './types';
import './starting-point.scss';

interface StartingPointConfig {
	title: TranslateResult;
	description: TranslateResult;
	icon: React.ReactElement;
	startingPoint: StartingPointFlag;
	actionText: TranslateResult;
}

interface Props {
	onSelect: ( startingPoint: StartingPointFlag ) => void;
	translate: LocalizeProps[ 'translate' ];
}

const useStartingPoints = ( { translate }: Pick< Props, 'translate' > ): StartingPointConfig[] => {
	return [
		{
			title: translate( 'Draft your first post' ),
			description: translate( 'Start writing and build an audience' ),
			icon: write,
			startingPoint: 'write',
			actionText: translate( 'Start writing' ),
		},
		{
			title: translate( 'Choose a design' ),
			description: translate( 'Make your blog feel like home' ),
			icon: design,
			startingPoint: 'design',
			actionText: translate( 'View designs' ),
		},
	];
};

const StartingPoint: React.FC< Props > = ( { onSelect, translate } ) => {
	const startingPoints = useStartingPoints( { translate } );

	return (
		<div className="starting-point">
			<div className="starting-point__cards">
				{ startingPoints.map( ( { title, description, icon, actionText, startingPoint } ) => (
					<div key={ startingPoint } className="starting-point__card">
						<Icon className="starting-point__card-icon" icon={ icon } size={ 24 } />
						<div className="starting-point__card-info-wrapper">
							<div className="starting-point__card-info">
								<h2 className="starting-point__card-title">{ title }</h2>
								<p className="starting-point__card-description">{ description }</p>
							</div>
							<Button
								className="starting-point__card-button"
								onClick={ () => onSelect( startingPoint ) }
							>
								{ actionText }
							</Button>
						</div>
					</div>
				) ) }
			</div>
		</div>
	);
};

export default localize( StartingPoint );

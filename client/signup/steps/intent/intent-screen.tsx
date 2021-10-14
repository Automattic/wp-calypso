import { Button } from '@automattic/components';
import { Icon } from '@wordpress/icons';
import { localize, LocalizeProps, TranslateResult } from 'i18n-calypso';
import React from 'react';
import { build, write } from '../../icons';
import type { IntentFlag } from './types';
import './intent-screen.scss';

interface Intent {
	title: TranslateResult;
	description: TranslateResult;
	icon: React.ReactElement;
	intent: IntentFlag;
	actionText: TranslateResult;
}

interface Props {
	onSelect: ( intent: IntentFlag ) => void;
	translate: LocalizeProps[ 'translate' ];
}

const useIntents = ( { translate }: Pick< Props, 'translate' > ): Intent[] => {
	return [
		{
			title: translate( 'Write' ),
			description: translate( 'Share your ideas with the world' ),
			icon: write,
			intent: 'write',
			actionText: translate( 'Start writing' ),
		},
		{
			title: translate( 'Build' ),
			description: translate( 'Begin creating your website' ),
			icon: build,
			intent: 'build',
			actionText: translate( 'Start building' ),
		},
	];
};

const IntentScreen: React.FC< Props > = ( { onSelect, translate } ) => {
	const intents = useIntents( { translate } );

	return (
		<div className="intent-screen">
			<div className="intent-screen__cards">
				{ intents.map( ( { title, description, icon, actionText, intent } ) => (
					<div key={ intent } className="intent-screen__card">
						<Icon className="intent-screen__card-icon" icon={ icon } size={ 24 } />
						<div className="intent-screen__card-info-wrapper">
							<div className="intent-screen__card-info">
								<h2 className="intent-screen__card-title">{ title }</h2>
								<p className="intent-screen__card-description">{ description }</p>
							</div>
							<Button className="intent-screen__card-button" onClick={ () => onSelect( intent ) }>
								{ actionText }
							</Button>
						</div>
					</div>
				) ) }
			</div>
		</div>
	);
};

export default localize( IntentScreen );

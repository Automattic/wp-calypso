import { Button } from '@automattic/components';
import { Icon } from '@wordpress/icons';
import classnames from 'classnames';
import { localize, LocalizeProps } from 'i18n-calypso';
import React from 'react';
import { build, write } from './icons';
import type { IntentFlag } from './types';
import './intent-screen.scss';

interface Intent {
	title: string;
	description: string;
	icon: React.ReactElement | null;
	intent: IntentFlag;
	actionText: string;
	href?: string;
}

interface Props {
	onSelect: ( intent: IntentFlag ) => void;
	translate: LocalizeProps[ 'translate' ];
}

const useIntents = ( { translate } ): Intent[] => {
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
		{
			title: '',
			description: 'Let our experts create your dream site',
			icon: null,
			intent: 'do-it-for-me',
			actionText: translate( 'Do it for me' ),
			href: 'do-it-for-me',
		},
	];
};

const IntentScreen: React.FC< Props > = ( { onSelect, translate } ) => {
	const intents = useIntents( { translate } );

	return (
		<div className="intent-screen">
			<div className="intent-screen__cards">
				{ intents.map( ( { title, description, icon, actionText, intent, href } ) => (
					<div
						key={ intent }
						className={ classnames( 'intent-screen__card', { 'has-link': href } ) }
					>
						{ icon && <Icon className="intent-screen__card-icon" icon={ icon } size={ 24 } /> }
						<div className="intent-screen__card-info-wrapper">
							<div className="intent-screen__card-info">
								{ title && <h2 className="intent-screen__card-title">{ title }</h2> }
								<p className="intent-screen__card-description">{ description }</p>
							</div>
							<Button
								className={ href ? 'intent-screen__card-link' : 'intent-screen__card-button' }
								href={ href }
								borderless={ !! href }
								onClick={ ( event: React.MouseEvent ) => {
									event.preventDefault();
									onSelect( intent );
								} }
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

export default localize( IntentScreen );

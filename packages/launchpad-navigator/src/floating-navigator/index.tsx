import { Card, Gridicon } from '@automattic/components';
import { LaunchpadNavigator } from '@automattic/data-stores';
import { DefaultWiredLaunchpad } from '@automattic/launchpad';
import { Button } from '@wordpress/components';
import { select } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';

import './style.scss';

type ToggleLaunchpadIsVisible = ( shouldBeVisible: boolean ) => void;

export type FloatingNavigatorProps = {
	pageExitCallback?: (
		path: string,
		handler: ( context: object, next: () => void ) => void
	) => void;
	siteSlug: string | null;
	toggleLaunchpadIsVisible?: ToggleLaunchpadIsVisible;
};

let _is_page_exit_registered = false;

const FloatingNavigator = ( {
	pageExitCallback,
	siteSlug,
	toggleLaunchpadIsVisible,
}: FloatingNavigatorProps ) => {
	const launchpadContext = 'launchpad-navigator';
	const translate = useTranslate();
	const checklistSlug = select( LaunchpadNavigator.store ).getActiveChecklistSlug() || null;

	useEffect( () => {
		if ( pageExitCallback && ! _is_page_exit_registered && toggleLaunchpadIsVisible ) {
			pageExitCallback( '*', ( context, next ) => {
				toggleLaunchpadIsVisible( false );
				next();
			} );
			_is_page_exit_registered = true;
		}
	}, [ pageExitCallback, toggleLaunchpadIsVisible ] );

	if ( ! checklistSlug ) {
		return null;
	}

	const setLaunchpadIsVisible = toggleLaunchpadIsVisible || ( () => {} );

	return (
		<Card className="launchpad-navigator__floating-navigator">
			<div className="launchpad-navigator__floating-navigator-header">
				<h2>{ translate( 'Next steps for your site' ) }</h2>
				<Button
					aria-label={ translate( 'Close task list modal' ) }
					className="launchpad-navigator__floating-navigator-close-button"
					onClick={ () => setLaunchpadIsVisible( false ) }
				>
					<Gridicon icon="cross" size={ 18 } />
				</Button>
			</div>
			<DefaultWiredLaunchpad
				siteSlug={ siteSlug }
				checklistSlug={ checklistSlug }
				launchpadContext={ launchpadContext }
			/>
			<div className="launchpad-navigator__floating-navigator-actions">
				<Button disabled variant="secondary">
					{ translate( 'Older tasks' ) }
				</Button>
			</div>
		</Card>
	);
};

export default FloatingNavigator;

import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import OverviewProducts from 'calypso/jetpack-cloud/sections/overview/primary/overview-products';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import IntroCards from '../intro-cards';
import NextSteps from '../next-steps';

import './style.scss';

export default function Overview() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_manage_overview_visit' ) );
	}, [ dispatch ] );

	const getPrefFromLocalStorage = ( key: string ): boolean => {
		const rawPref = localStorage.getItem( key ) ?? 'false';
		try {
			return JSON.parse( rawPref );
		} catch {
			return false;
		}
	};

	const [ hideIntroCards, setHideIntroCards ] = useState( () =>
		getPrefFromLocalStorage( 'jetpack_manage_hide_intro_cards' )
	);

	const [ hideNextSteps, setHideNextSteps ] = useState( () =>
		getPrefFromLocalStorage( 'jetpack_manage_hide_next_steps' )
	);

	const introCardFinishHandler = (): void => {
		setHideIntroCards( true );
		localStorage.setItem( 'jetpack_manage_hide_intro_cards', JSON.stringify( true ) );
	};

	const nextStepsDismissHandler = (): void => {
		setHideNextSteps( true );
		localStorage.setItem( 'jetpack_manage_hide_next_steps', JSON.stringify( true ) );
	};

	return (
		<div className="overview">
			<DocumentHead title={ translate( 'Overview' ) } />
			{ ! hideIntroCards && (
				<Card>
					<IntroCards onFinish={ introCardFinishHandler } />
				</Card>
			) }
			{ ! hideNextSteps && (
				<Card className="hide-on-mobile">
					<NextSteps onDismiss={ nextStepsDismissHandler } />
				</Card>
			) }
			<Card>
				<OverviewProducts />
			</Card>
		</div>
	);
}

import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import IntroCards from '../intro-cards';

import './style.scss';

export default function Overview() {
	const translate = useTranslate();

	const [ hideIntroCards, setHideIntroCards ] = useState( () => {
		const rawPref = localStorage.getItem( 'jetpack_manage_hide_intro_cards' ) ?? 'false';
		try {
			return JSON.parse( rawPref );
		} catch {
			return false;
		}
	} );

	const finishHandler = () => {
		setHideIntroCards( true );
		localStorage.setItem( 'jetpack_manage_hide_intro_cards', JSON.stringify( true ) );
	};

	return (
		<div className="overview">
			<DocumentHead title={ translate( 'Overview' ) } />
			{ ! hideIntroCards && (
				<Card>
					<IntroCards onFinish={ finishHandler } />
				</Card>
			) }
			{ /*<Card className="overview__steps">*/ }
			{ /*	/!*<OverviewSteps />*!/*/ }
			{ /*</Card>*/ }
			{ /*<Card className="overview__tools">*/ }
			{ /*	/!*<OverviewTools />*!/*/ }
			{ /*</Card>*/ }
		</div>
	);
}

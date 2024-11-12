import { Card } from '@wordpress/components';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { CONTACT_URL_FOR_MIGRATION_OFFER_HASH_FRAGMENT } from 'calypso/a8c-for-agencies/components/a4a-contact-support-widget';
import PageSection from 'calypso/a8c-for-agencies/components/page-section';
import { BackgroundType7 } from 'calypso/a8c-for-agencies/components/page-section/backgrounds';
import { preventWidows } from 'calypso/lib/formatting';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

function MigrationsProcessCard( { number, text }: { number: number; text: TranslateResult } ) {
	return (
		<Card className="migrations-process__card">
			<div className="migrations-process__card-number">{ number }</div>
			<div className="migrations-process__card-text">{ preventWidows( text ) }</div>
		</Card>
	);
}

export default function MigrationsProcess() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const onFillUpFormLinkClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_migrations_fill_up_form_link_click' ) );
	}, [ dispatch ] );

	return (
		<PageSection
			heading={ translate( 'We’ll migrate your sites for you' ) }
			description={ translate( 'Transfer your WordPress websites hassle-free with our help.' ) }
			background={ BackgroundType7 }
		>
			<div className="migrations-process__cards">
				<MigrationsProcessCard
					number={ 1 }
					text={ translate( 'Fill out the contact form {{a}}here{{/a}}.', {
						components: {
							a: (
								<a
									href={ CONTACT_URL_FOR_MIGRATION_OFFER_HASH_FRAGMENT }
									onClick={ onFillUpFormLinkClick }
								/>
							),
						},
					} ) }
				/>
				<MigrationsProcessCard
					number={ 2 }
					text={ translate( 'Speak with a Happiness Engineer.' ) }
				/>
				<MigrationsProcessCard
					number={ 3 }
					text={ translate( 'Pick the hosting that’s right for you.' ) }
				/>
				<MigrationsProcessCard
					number={ 4 }
					text={ translate( 'We’ll migrate your sites for you.' ) }
				/>
			</div>
		</PageSection>
	);
}

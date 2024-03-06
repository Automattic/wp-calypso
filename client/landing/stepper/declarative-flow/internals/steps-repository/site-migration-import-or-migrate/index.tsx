import {
	NextButton,
	StepContainer,
	Title,
	SelectCardRadio,
	SelectCardRadioList,
} from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { useState, useCallback } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';
import './style.scss';

type SubmitDestination = 'import' | 'migrate' | 'upgrade';

const SiteMigrationImportOrMigrate: Step = function ( { navigation } ) {
	const translate = useTranslate();
	const site = useSite();
	const options = [
		{
			label: translate( 'Everything (requires a Creator Plan)' ),
			description: translate(
				"All your site's content, themes, plugins, users, and customizations."
			),
			value: 'migrate',
			selected: true,
		},
		{
			label: translate( 'Content only (free)' ),
			description: translate( 'Import just posts, pages, comments, and media.' ),
			value: 'import',
		},
	];

	const [ destination, setDestination ] = useState< SubmitDestination >(
		( options.find( ( o ) => o.selected )?.value ?? options[ 0 ].value ) as SubmitDestination
	);

	const canInstallPlugins = site?.plan?.features?.active.find(
		( feature ) => feature === 'install-plugins'
	)
		? true
		: false;

	const handleSubmit = useCallback( () => {
		if ( destination === 'migrate' && ! canInstallPlugins ) {
			return navigation.submit?.( { destination: 'upgrade' } );
		}
		return navigation.submit?.( { destination } );
	}, [ destination, navigation, canInstallPlugins ] );

	const stepContent = (
		<div className="import-or-migrate__content">
			<Title className="import-or-migrate__title">
				{ translate( 'What do you want to migrate?' ) }
			</Title>

			<SelectCardRadioList className="import-or-migrate__list">
				{ options.map( ( option, i ) => (
					<SelectCardRadio
						key={ i }
						option={ option }
						name="import-or-migrate"
						onChange={ () => {
							setDestination( option.value as SubmitDestination );
						} }
					/>
				) ) }
			</SelectCardRadioList>
			<NextButton onClick={ handleSubmit }>{ translate( 'Continue' ) }</NextButton>
		</div>
	);

	return (
		<>
			<DocumentHead title={ translate( 'Where will you import from?' ) } />
			<StepContainer
				stepName="site-migration-import-or-migrate"
				className="import-or-migrate"
				shouldHideNavButtons={ false }
				hideSkip={ true }
				hideBack={ true }
				stepContent={ stepContent }
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default SiteMigrationImportOrMigrate;

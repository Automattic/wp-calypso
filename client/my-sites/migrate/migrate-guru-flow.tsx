import page from '@automattic/calypso-router';
import { Analyzer } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/site-migration-identify';
import { SiteMigrationInstructions } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/site-migration-instructions-i2';
import { useSelector } from 'calypso/state';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { BrowserRouter } from 'react-router-dom';

export const AnalyzerStep = ( props: any ) => {
	const site = useSelector( ( state ) => getSite( state, getSelectedSiteId( state ) as any ) );

	if ( ! site ) {
		return null;
	}

	const onComplete = ( data: any ) => {
		page( `/migrate-guru/instructions/${ site.slug }?from=${ data.url }` );
	};

	const onSkip = () => {
		console.log( 'AnalyzerStep onSkip' );
	};
	return (
		<>
			<BrowserRouter>
				<Analyzer onComplete={ onComplete } onSkip={ onSkip } />
			</BrowserRouter>
		</>
	);
};

export const InstructionsStep = ( props: any ) => {
	const site = useSelector( ( state ) => getSite( state, getSelectedSiteId( state ) as any ) );

	if ( ! site ) {
		return null;
	}

	const onError = ( data: any ) => {
		console.log( data );
	};

	const fromUrl = new URLSearchParams( window.location.search ).get( 'from' ) || '';

	return (
		<>
			<SiteMigrationInstructions site={ site } fromUrl={ fromUrl } onError={ onError } />{ ' ' }
		</>
	);
};

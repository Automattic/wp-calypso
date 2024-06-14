import { OnboardSelect, type UserSelect } from '@automattic/data-stores';
import { isHostedSiteMigrationFlow } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { Children, lazy, Suspense, useCallback, useLayoutEffect, useMemo } from 'react';
import { generatePath, Route, Routes, useLocation, useNavigate } from 'react-router';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { addQueryArgs } from 'calypso/lib/url';
import { useSaveQueryParams } from '../hooks/use-save-query-params';
import { useSiteData } from '../hooks/use-site-data';
import useSyncRoute from '../hooks/use-sync-route';
import { ONBOARD_STORE, STEPPER_INTERNAL_STORE, USER_STORE } from '../stores';
import { STEPS } from './internals/steps';
import { type SiteMigrationIdentifyAction } from './internals/steps-repository/site-migration-identify';
import type { ProvidedDependencies, StepperStep, StepProps } from './internals/types';

const Flow = ( { children, name } ) => {
	const location = useLocation();
	useLayoutEffect( () => {
		window.scrollTo( 0, 0 );
	}, [ location ] );

	return (
		<Routes>
			{ Children.map( children, ( child ) => {
				const { step } = child.props;
				return <Route path={ `${ name }/${ step.slug }` } element={ child } />;
			} ) }
		</Routes>
	);
};

interface StepProps {
	step: StepperStep;
	onSubmit?: () => void;
	onGoBack: () => void;
}

const Step = ( { step, onSubmit, onGoBack }: StepProps ) => {
	//compatibility layer
	const navigation = {
		submit: onSubmit,
		goBack: onGoBack,
	};

	const Component = lazy( step.asyncComponent );

	return (
		<Suspense>
			<Component navigation={ navigation } />
		</Suspense>
	);
};

const exitFlow = ( to: string ) => {
	window.location.assign( to );
};

const useFlowNavigation = () => {
	const { pathname } = useLocation();
	const [ , flowName ] = pathname.split( '/' );
	const currentStepRoute = location.pathname.split( '/' )[ 2 ]?.replace( /\/+$/, '' );
	const navigate = useNavigate();
	const { setStepData } = useDispatch( STEPPER_INTERNAL_STORE );
	const intent = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIntent(),
		[]
	);

	useSaveQueryParams();

	const _navigate = useCallback(
		( path: string, extraData = {} ) => {
			// If any extra data is passed to the navigate() function, store it to the stepper-internal store.
			setStepData( {
				path: path,
				intent: intent,
				previousStep: currentStepRoute,
				...extraData,
			} );

			const _path = path.includes( '?' ) // does path contain search params
				? generatePath( `/${ flowName }/${ path }` )
				: generatePath( `/${ flowName }/${ path }${ window.location.search }` );

			navigate( _path );
		},
		[ currentStepRoute, flowName, intent, navigate, setStepData ]
	);

	useSyncRoute();

	return useMemo(
		() => ( {
			navigate: _navigate,
			flowName,
		} ),
		[ flowName, _navigate ]
	);
};

// export default siteMigration;
const SiteMigrationFlow = () => {
	const { siteId, siteSlug } = useSiteData();
	const siteCount =
		useSelect( ( select ) => ( select( USER_STORE ) as UserSelect ).getCurrentUser(), [] )
			?.site_count ?? 0;
	const urlQueryParams = useQuery();
	const fromQueryParam = urlQueryParams.get( 'from' );
	const { navigate, flowName } = useFlowNavigation();

	const onIdentifySubmit = ( providedDependencies: {
		from: string;
		platform: string;
		action: SiteMigrationIdentifyAction;
	} ) => {
		const { from, platform, action } = providedDependencies as {
			from: string;
			platform: string;
			action: SiteMigrationIdentifyAction;
		};

		if ( action === 'skip_platform_identification' || platform !== 'wordpress' ) {
			if ( isHostedSiteMigrationFlow( flowName ) ) {
				if ( ! siteSlug ) {
					return navigate( STEPS.SITE_CREATION_STEP.slug );
				}
			}
			return exitFlow(
				addQueryArgs(
					{
						siteId,
						siteSlug,
						from,
						origin: STEPS.SITE_MIGRATION_IDENTIFY.slug,
						backToFlow: `/${ flowName }/${ STEPS.SITE_MIGRATION_IDENTIFY.slug }`,
					},
					'/setup/site-setup/importList'
				)
			);
		}

		if ( isHostedSiteMigrationFlow( flowName ) ) {
			if ( ! siteSlug ) {
				if ( siteCount > 0 ) {
					return navigate( `sitePicker?from=${ encodeURIComponent( from ) }` );
				}

				if ( from ) {
					return navigate( addQueryArgs( { from }, STEPS.SITE_CREATION_STEP.slug ) );
				}
				return navigate( 'error' );
			}
		}

		return navigate(
			addQueryArgs( { from: from, siteSlug, siteId }, STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE.slug )
		);
	};

	const onImportOrMigrateSubmit = ( providedDependencies: ProvidedDependencies ) => {
		// Switch to the normal Import flow.
		if ( providedDependencies?.destination === 'import' ) {
			return exitFlow(
				addQueryArgs(
					{
						siteSlug,
						from: fromQueryParam ?? '',
						option: 'content',
						backToFlow: `/${ flowName }/${ STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE.slug }`,
					},
					`/setup/site-setup/importerWordpress`
				)
			);
		}

		// Take the user to the upgrade plan step.
		if ( providedDependencies?.destination === 'upgrade' ) {
			return navigate( STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug, {
				siteId,
				siteSlug,
			} );
		}

		// Continue with the migration flow.
		return navigate( STEPS.SITE_MIGRATION_INSTRUCTIONS_I2.slug, {
			siteId,
			siteSlug,
		} );
	};

	return (
		<Flow name="site-migration">
			<Step step={ STEPS.SITE_MIGRATION_IDENTIFY } onSubmit={ onIdentifySubmit } />
			<Step
				step={ STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE }
				onGoBack={ () => navigate( STEPS.SITE_MIGRATION_IDENTIFY.slug ) }
				onSubmit={ onImportOrMigrateSubmit }
			/>
		</Flow>
	);
};

export default SiteMigrationFlow;

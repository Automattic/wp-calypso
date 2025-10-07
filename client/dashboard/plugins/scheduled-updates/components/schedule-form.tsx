import {
	Button,
	Card,
	CardBody,
	Notice,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useCallback, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { SectionHeader } from '../../../components/section-header';
import {
	NEW_SCHEDULE_DEFAULT_FREQUENCY,
	NEW_SCHEDULE_DEFAULT_TIME,
	NEW_SCHEDULE_DEFAULT_WEEKDAY,
} from '../constants';
import { formatScheduleCollisionsErrorMulti } from '../helpers';
import { useEligibleSites } from '../hooks/use-eligible-sites';
import { useScheduleCollisions } from '../hooks/use-schedule-collisions';
import FrequencySelection from './frequency-selection';
import PluginsSelection from './plugins-selection';
import SitesSelection from './sites-selection';
import type { Frequency, Weekday } from '../types';

const BLOCK_CREATE = true;

type Inputs = {
	siteIds: string[];
	plugins: string[];
	frequency: Frequency;
	weekday: Weekday;
	time: string; // HH:MM 24h
};

export type InitialValues = Partial< Inputs >;
export type ScheduledUpdatesFormOnSubmit = ( inputs: Inputs ) => Promise< void > | void;

type Props = {
	submitLabel: string;
	onSubmit: ScheduledUpdatesFormOnSubmit;
	initial?: InitialValues;
	onSitesChange?: ( ids: string[] ) => void;
	/**
	 * Context about the currently edited schedule (if any) so the form
	 * can exclude it from collision validation.
	 */
	editedSchedule?: { siteIds: number[]; scheduleId: string };
};

export function ScheduledUpdatesForm( {
	submitLabel,
	onSubmit,
	initial,
	onSitesChange,
	editedSchedule,
}: Props ) {
	const { data: eligibleSites = [] } = useEligibleSites();
	const [ selectedSiteIds, setSelectedSiteIds ] = useState< string[] >(
		() => initial?.siteIds || []
	);
	const [ selectedPluginSlugs, setSelectedPluginSlugs ] = useState< string[] >(
		initial?.plugins || []
	);
	const [ frequency, setFrequency ] = useState< Frequency >(
		initial?.frequency || NEW_SCHEDULE_DEFAULT_FREQUENCY
	);
	const [ weekday, setWeekday ] = useState< Weekday >(
		initial?.weekday || NEW_SCHEDULE_DEFAULT_WEEKDAY
	);
	const [ time, setTime ] = useState( initial?.time || NEW_SCHEDULE_DEFAULT_TIME );
	const [ validationError, setValidationError ] = useState< string >( '' );
	const [ isSubmitting, setIsSubmitting ] = useState( false );

	const siteIdsAsNumbers = useMemo(
		() => selectedSiteIds.map( ( id ) => Number( id ) ),
		[ selectedSiteIds ]
	);
	const collisionsChecker = useScheduleCollisions(
		undefined,
		editedSchedule ? { exclude: editedSchedule } : undefined
	);
	const isValid = selectedSiteIds.length > 0 && selectedPluginSlugs.length > 0;
	const isPrecheckLoading = collisionsChecker.isLoading;

	const handleSave = useCallback( async () => {
		setValidationError( '' );
		setIsSubmitting( true );

		try {
			const collisions = collisionsChecker.validateNow( {
				siteIds: siteIdsAsNumbers,
				plugins: selectedPluginSlugs,
				frequency,
				weekday,
				time,
			} );

			const message = formatScheduleCollisionsErrorMulti( {
				collisions,
				eligibleSites,
				selectedSiteIds: siteIdsAsNumbers,
			} );

			if ( message ) {
				throw new Error( message );
			}

			await onSubmit( {
				siteIds: selectedSiteIds,
				plugins: selectedPluginSlugs,
				frequency,
				weekday,
				time,
			} );

			setIsSubmitting( false );
		} catch ( err ) {
			setIsSubmitting( false );
			setValidationError(
				( err as { message?: string } )?.message || __( 'Failed to save schedule.' )
			);
		}
	}, [
		collisionsChecker,
		siteIdsAsNumbers,
		selectedPluginSlugs,
		frequency,
		weekday,
		time,
		eligibleSites,
		onSubmit,
		selectedSiteIds,
	] );

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 6 }>
					<SectionHeader title={ __( '1. Select sites' ) } />
					<SitesSelection
						selection={ selectedSiteIds }
						onChangeSelection={ ( ids ) => {
							setSelectedSiteIds( ids );
							onSitesChange?.( ids );
						} }
					/>
					<SectionHeader
						title={ __( '2. Select plugins' ) }
						description={ __(
							'Plugins not listed below are automatically updated by WordPress.com.'
						) }
					/>
					<PluginsSelection
						selectedSiteIds={ selectedSiteIds }
						selection={ selectedPluginSlugs }
						onChangeSelection={ ( ids ) => setSelectedPluginSlugs( ids ) }
					/>
					<SectionHeader title={ __( '3. Select frequency' ) } />
					<FrequencySelection
						frequency={ frequency }
						weekday={ weekday }
						time={ time }
						onChange={ ( next ) => {
							setFrequency( next.frequency );
							setWeekday( next.weekday );
							setTime( next.time );
						} }
					/>
					{ validationError && (
						<Notice status="error" isDismissible={ false }>
							{ validationError.split( '\n' ).map( ( line, idx ) => (
								<div key={ idx }>{ line }</div>
							) ) }
						</Notice>
					) }
					<div>
						<Button
							variant="primary"
							disabled={ ! isValid || isSubmitting || isPrecheckLoading || BLOCK_CREATE }
							onClick={ handleSave }
							__next40pxDefaultSize
						>
							{ submitLabel }
						</Button>
					</div>
				</VStack>
			</CardBody>
		</Card>
	);
}

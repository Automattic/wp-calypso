import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	AgencyLeadMatchingProfile,
	AgencyLeadMatchingResponse,
	LeadMatchingDetails,
} from '../../types';
import { mapLeadMatchingDetailsToProfile } from '../../utils/map-application-form-data';
import { SubmitSource } from './use-submit-form';

export type AutosaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error';

type SubmitParams = {
	formData: LeadMatchingDetails;
	profile?: AgencyLeadMatchingProfile | null;
	source?: SubmitSource;
};

type Props = {
	formData: LeadMatchingDetails;
	profile?: AgencyLeadMatchingProfile | null;
	onSubmit: ( params: SubmitParams ) => Promise< AgencyLeadMatchingResponse | undefined >;
};

type DraftState = {
	formData: LeadMatchingDetails;
	profile?: AgencyLeadMatchingProfile | null;
	snapshot: string;
};

const getPayloadSnapshot = (
	formData: LeadMatchingDetails,
	profile?: AgencyLeadMatchingProfile | null
) => JSON.stringify( mapLeadMatchingDetailsToProfile( formData, profile ) );

export default function useLeadMatchingAutosave( { formData, profile, onSubmit }: Props ) {
	const currentSnapshot = useMemo(
		() => getPayloadSnapshot( formData, profile ),
		[ formData, profile ]
	);
	const [ autosaveStatus, setAutosaveStatus ] = useState< AutosaveStatus >( 'idle' );
	const [ lastSavedSnapshot, setLastSavedSnapshot ] = useState( currentSnapshot );
	const latestDraftRef = useRef< DraftState >( { formData, profile, snapshot: currentSnapshot } );
	const lastSavedSnapshotRef = useRef( currentSnapshot );
	const isSavingRef = useRef( false );
	const isMountedRef = useRef( true );

	latestDraftRef.current = { formData, profile, snapshot: currentSnapshot };
	lastSavedSnapshotRef.current = lastSavedSnapshot;

	const hasUnsavedChanges = currentSnapshot !== lastSavedSnapshot;

	const runSave = useCallback(
		async ( source: SubmitSource ) => {
			const { formData: nextFormData, profile: nextProfile, snapshot } = latestDraftRef.current;

			if ( snapshot === lastSavedSnapshotRef.current ) {
				if ( isMountedRef.current ) {
					setAutosaveStatus( 'saved' );
				}
				return undefined;
			}

			if ( isSavingRef.current ) {
				return undefined;
			}

			isSavingRef.current = true;
			if ( isMountedRef.current ) {
				setAutosaveStatus( 'saving' );
			}

			const response = await onSubmit( {
				formData: nextFormData,
				profile: nextProfile,
				source,
			} );

			if ( response?.lead_matching_profile ) {
				const savedSnapshot = JSON.stringify( response.lead_matching_profile );
				lastSavedSnapshotRef.current = savedSnapshot;
				if ( isMountedRef.current ) {
					setLastSavedSnapshot( savedSnapshot );
					setAutosaveStatus( 'saved' );
				}
			} else if ( isMountedRef.current ) {
				setAutosaveStatus( 'error' );
			}

			isSavingRef.current = false;

			return response;
		},
		[ onSubmit ]
	);

	useEffect( () => {
		if ( ! hasUnsavedChanges ) {
			setAutosaveStatus( ( currentStatus ) =>
				currentStatus === 'idle' ? currentStatus : 'saved'
			);
			return;
		}

		setAutosaveStatus( 'unsaved' );
	}, [ hasUnsavedChanges ] );

	useEffect(
		() => () => {
			isMountedRef.current = false;
		},
		[]
	);

	const saveNow = useCallback( () => runSave( 'manual' ), [ runSave ] );
	const saveOnExit = useCallback( () => runSave( 'exit' ), [ runSave ] );

	return {
		autosaveStatus,
		hasUnsavedChanges,
		saveNow,
		saveOnExit,
	};
}

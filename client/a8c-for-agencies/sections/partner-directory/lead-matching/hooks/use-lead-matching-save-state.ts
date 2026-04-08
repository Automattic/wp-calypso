import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	AgencyLeadMatchingProfile,
	AgencyLeadMatchingResponse,
	LeadMatchingDetails,
} from '../../types';
import { mapLeadMatchingDetailsToProfile } from '../../utils/map-application-form-data';
import { SubmitSource } from './use-submit-form';

export type SaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error';

type SubmitParams = {
	formData: LeadMatchingDetails;
	profile?: AgencyLeadMatchingProfile | null;
	acceptingWork?: boolean;
	source?: SubmitSource;
};

type Props = {
	formData: LeadMatchingDetails;
	profile?: AgencyLeadMatchingProfile | null;
	acceptingWork?: boolean;
	onSubmit: ( params: SubmitParams ) => Promise< AgencyLeadMatchingResponse | undefined >;
};

type DraftState = {
	formData: LeadMatchingDetails;
	profile?: AgencyLeadMatchingProfile | null;
	acceptingWork?: boolean;
	snapshot: string;
};

const isSuccessfulResponse = ( response?: AgencyLeadMatchingResponse ) =>
	!! response?.lead_matching_profile && response.sync?.status !== 'failed';

const getProfileSnapshot = ( profile: AgencyLeadMatchingProfile ) => {
	const { availability, ...snapshotProfile } = profile;
	return JSON.stringify( snapshotProfile );
};

const getPayloadSnapshot = (
	formData: LeadMatchingDetails,
	profile?: AgencyLeadMatchingProfile | null
) => getProfileSnapshot( mapLeadMatchingDetailsToProfile( formData, profile ) );

export default function useLeadMatchingSaveState( {
	formData,
	profile,
	acceptingWork,
	onSubmit,
}: Props ) {
	const currentSnapshot = useMemo(
		() => getPayloadSnapshot( formData, profile ),
		[ formData, profile ]
	);
	const [ saveStatus, setSaveStatus ] = useState< SaveStatus >( 'idle' );
	const [ lastSavedSnapshot, setLastSavedSnapshot ] = useState( currentSnapshot );
	const latestDraftRef = useRef< DraftState >( {
		formData,
		profile,
		acceptingWork,
		snapshot: currentSnapshot,
	} );
	const lastSavedSnapshotRef = useRef( currentSnapshot );
	const isSavingRef = useRef( false );
	const isMountedRef = useRef( true );

	latestDraftRef.current = { formData, profile, acceptingWork, snapshot: currentSnapshot };
	lastSavedSnapshotRef.current = lastSavedSnapshot;

	const hasUnsavedChanges = currentSnapshot !== lastSavedSnapshot;

	const runSave = useCallback(
		async ( source: SubmitSource ) => {
			const {
				formData: nextFormData,
				profile: nextProfile,
				acceptingWork: nextAcceptingWork,
				snapshot,
			} = latestDraftRef.current;

			if ( snapshot === lastSavedSnapshotRef.current ) {
				if ( isMountedRef.current ) {
					setSaveStatus( 'saved' );
				}
				return undefined;
			}

			if ( isSavingRef.current ) {
				return undefined;
			}

			isSavingRef.current = true;
			if ( isMountedRef.current ) {
				setSaveStatus( 'saving' );
			}

			const response = await onSubmit( {
				formData: nextFormData,
				profile: nextProfile,
				...( nextAcceptingWork !== undefined ? { acceptingWork: nextAcceptingWork } : {} ),
				source,
			} );

			if ( isSuccessfulResponse( response ) ) {
				const savedSnapshot = snapshot;
				lastSavedSnapshotRef.current = savedSnapshot;
				if ( isMountedRef.current ) {
					setLastSavedSnapshot( savedSnapshot );
					setSaveStatus( 'saved' );
				}
			} else if ( isMountedRef.current ) {
				setSaveStatus( 'error' );
			}

			isSavingRef.current = false;

			return response;
		},
		[ onSubmit ]
	);

	useEffect( () => {
		if ( ! hasUnsavedChanges ) {
			setSaveStatus( ( currentStatus ) => ( currentStatus === 'idle' ? currentStatus : 'saved' ) );
			return;
		}

		setSaveStatus( 'unsaved' );
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
		saveStatus,
		hasUnsavedChanges,
		saveNow,
		saveOnExit,
	};
}

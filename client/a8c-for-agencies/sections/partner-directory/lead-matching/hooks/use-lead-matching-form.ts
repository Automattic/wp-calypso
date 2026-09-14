import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { updateActiveAgencyLeadMatching } from 'calypso/state/a8c-for-agencies/agency/actions';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { LeadMatchingDetails } from '../../types';
import { createDefaultLeadMatchingDetails } from '../../utils/map-application-form-data';

type Props = {
	agencyId?: number;
	initialFormData?: LeadMatchingDetails | null;
};

const areLeadMatchingDetailsEqual = (
	first: LeadMatchingDetails | null | undefined,
	second: LeadMatchingDetails | null | undefined
) => JSON.stringify( first ) === JSON.stringify( second );

export const shouldHydrateLeadMatchingDraft = (
	draftFormData: LeadMatchingDetails | undefined,
	previousInitialData: LeadMatchingDetails | null
) => ! draftFormData || areLeadMatchingDetailsEqual( draftFormData, previousInitialData );

export default function useLeadMatchingForm( { agencyId, initialFormData }: Props ) {
	const dispatch = useDispatch();
	const agency = useSelector( getActiveAgency );
	const previousInitialDataRef = useRef< LeadMatchingDetails | null >( null );
	const fallbackFormData = useMemo(
		() => initialFormData ?? createDefaultLeadMatchingDetails(),
		[ initialFormData ]
	);
	const draftFormData = agency?.lead_matching?.draft ?? undefined;
	const formData = draftFormData ?? fallbackFormData;

	const setDraftFormData = useCallback(
		( nextDraftFormData: LeadMatchingDetails ) => {
			dispatch( updateActiveAgencyLeadMatching( { draft: nextDraftFormData } ) );
		},
		[ dispatch ]
	);

	useEffect( () => {
		if ( ! agencyId || ! agency ) {
			return;
		}

		const previousInitialData = previousInitialDataRef.current;
		const shouldHydrateDraft = shouldHydrateLeadMatchingDraft( draftFormData, previousInitialData );

		if ( shouldHydrateDraft && ! areLeadMatchingDetailsEqual( draftFormData, fallbackFormData ) ) {
			setDraftFormData( fallbackFormData );
		}

		previousInitialDataRef.current = fallbackFormData;
	}, [ agency, agencyId, draftFormData, fallbackFormData, setDraftFormData ] );

	const updateField = < K extends keyof LeadMatchingDetails >(
		field: K,
		value: LeadMatchingDetails[ K ]
	) => {
		if ( ! agencyId ) {
			return;
		}

		setDraftFormData( {
			...formData,
			[ field ]: value,
		} );
	};

	return {
		formData,
		setFormData: ( nextFormData: LeadMatchingDetails ) => {
			if ( ! agencyId ) {
				return;
			}

			setDraftFormData( nextFormData );
		},
		updateField,
	};
}

/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from '@testing-library/react';
import {
	createDefaultLeadMatchingDetails,
	mapLeadMatchingDetailsToProfile,
} from '../../utils/map-application-form-data';
import useLeadMatchingSaveState from '../hooks/use-lead-matching-save-state';
import type { LeadMatchingDetails } from '../../types';

const createResponse = ( formData: LeadMatchingDetails ) => ( {
	agency_id: 1,
	lead_matching_profile: mapLeadMatchingDetailsToProfile( formData, null ),
} );

describe( 'useLeadMatchingSaveState', () => {
	it( 'marks rerendered draft changes as unsaved without autosaving', () => {
		const formData = createDefaultLeadMatchingDetails();
		const updatedFormData = {
			...formData,
			regions: [ 'americas' ],
		};
		const onSubmit = jest.fn();

		const { result, rerender } = renderHook(
			( currentFormData ) =>
				useLeadMatchingSaveState( {
					formData: currentFormData,
					profile: null,
					onSubmit,
				} ),
			{ initialProps: formData }
		);

		rerender( updatedFormData );

		expect( result.current.saveStatus ).toBe( 'unsaved' );
		expect( result.current.hasUnsavedChanges ).toBe( true );
		expect( onSubmit ).not.toHaveBeenCalled();
	} );

	it( 'runs a manual save immediately', async () => {
		const formData = createDefaultLeadMatchingDetails();
		const updatedFormData = {
			...formData,
			regions: [ 'americas' ],
		};
		const onSubmit = jest.fn().mockResolvedValue( createResponse( updatedFormData ) );

		const { result, rerender } = renderHook(
			( currentFormData ) =>
				useLeadMatchingSaveState( {
					formData: currentFormData,
					profile: null,
					onSubmit,
				} ),
			{ initialProps: formData }
		);

		rerender( updatedFormData );

		await act( async () => {
			await result.current.saveNow();
		} );

		expect( onSubmit ).toHaveBeenCalledTimes( 1 );
		expect( onSubmit ).toHaveBeenCalledWith( {
			formData: updatedFormData,
			profile: null,
			source: 'manual',
		} );
	} );

	it( 'runs a save on exit when there are unsaved changes', async () => {
		const formData = createDefaultLeadMatchingDetails();
		const updatedFormData = {
			...formData,
			regions: [ 'americas' ],
		};
		const onSubmit = jest.fn().mockResolvedValue( createResponse( updatedFormData ) );

		const { result, rerender } = renderHook(
			( currentFormData ) =>
				useLeadMatchingSaveState( {
					formData: currentFormData,
					profile: null,
					onSubmit,
				} ),
			{ initialProps: formData }
		);

		rerender( updatedFormData );

		await act( async () => {
			await result.current.saveOnExit();
		} );

		await waitFor( () => expect( onSubmit ).toHaveBeenCalledTimes( 1 ) );
		expect( onSubmit ).toHaveBeenCalledWith( {
			formData: updatedFormData,
			profile: null,
			source: 'exit',
		} );
	} );
} );

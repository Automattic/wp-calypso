import { useCallback, useState } from 'react';
import type {
	AgencyPartnerDirectoryEntryStatus,
	AgencyPartnerDirectorySlug,
	AgencyProfile,
} from '@automattic/api-core';

export interface ExpertiseDirectoryEntry {
	directory: AgencyPartnerDirectorySlug;
	urls: string[];
	note?: string;
	status?: AgencyPartnerDirectoryEntryStatus;
	isPublished?: boolean;
}

export interface ExpertiseFormData {
	services: string[];
	products: string[];
	directories: ExpertiseDirectoryEntry[];
	feedbackUrl: string;
	isPublished?: boolean;
}

/**
 * The agency's submitted application as expertise form data, or null when no
 * application was submitted yet.
 */
export function getExpertiseFormData( profile?: AgencyProfile | null ): ExpertiseFormData | null {
	const application = profile?.partner_directory_application;
	if ( ! profile || ! application ) {
		return null;
	}

	return {
		services: profile.listing_details.services ?? [],
		products: profile.listing_details.products ?? [],
		directories: application.directories.map(
			( { status, directory, is_published, urls, note } ) => ( {
				status,
				directory,
				isPublished: is_published,
				urls,
				note,
			} )
		),
		feedbackUrl: application.feedback_url,
		isPublished: !! application.is_published,
	};
}

export default function useExpertiseForm( {
	initialFormData,
}: {
	initialFormData: ExpertiseFormData | null;
} ) {
	const [ formData, setFormData ] = useState< ExpertiseFormData >(
		initialFormData ?? {
			services: [],
			products: [],
			directories: [],
			feedbackUrl: '',
		}
	);

	const isDirectorySelected = useCallback(
		( name: AgencyPartnerDirectorySlug ) =>
			formData.directories.some( ( { directory } ) => directory === name ),
		[ formData ]
	);

	const isDirectoryApproved = useCallback(
		( name: AgencyPartnerDirectorySlug ) =>
			formData.directories.some(
				( { directory, status } ) => directory === name && status === 'approved'
			),
		[ formData ]
	);

	const setDirectorySelected = useCallback(
		( name: AgencyPartnerDirectorySlug, selected: boolean ) => {
			setFormData( ( state ) => {
				if ( selected ) {
					return {
						...state,
						directories: [
							...state.directories,
							{
								status: 'pending' as const,
								directory: name,
								isPublished: false,
								urls: [ '', '', '', '', '' ],
								note: '',
							},
						],
					};
				}

				return {
					...state,
					directories: state.directories.filter( ( { directory } ) => directory !== name ),
				};
			} );
		},
		[]
	);

	const getDirectoryClientSamples = useCallback(
		( name: AgencyPartnerDirectorySlug ) =>
			formData.directories.find( ( { directory } ) => directory === name )?.urls ?? [],
		[ formData.directories ]
	);

	const setDirectoryClientSamples = useCallback(
		( name: AgencyPartnerDirectorySlug, urls: string[] ) => {
			setFormData( ( state ) => ( {
				...state,
				directories: state.directories.map( ( entry ) =>
					entry.directory === name ? { ...entry, urls } : entry
				),
			} ) );
		},
		[]
	);

	return {
		formData,
		setFormData,
		isDirectorySelected,
		isDirectoryApproved,
		setDirectorySelected,
		getDirectoryClientSamples,
		setDirectoryClientSamples,
	};
}

import { useCallback, useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import wpcom from 'calypso/lib/wp';

interface ProfileData {
	username: string;
	displayName: string;
	email: string;
	siteAddress: string;
	aboutMe: string;
	isDeveloper: boolean;
}

interface UseProfileResult {
	loading: boolean;
	error: string | null;
	profileData: ProfileData | null;
	saveProfile: ( data: ProfileData ) => Promise< void >;
}

export function useProfile(): UseProfileResult {
	const [ loading, setLoading ] = useState( true );
	const [ error, setError ] = useState< string | null >( null );
	const [ profileData, setProfileData ] = useState< ProfileData | null >( null );

	const fetchProfile = useCallback( async () => {
		try {
			setLoading( true );
			setError( null );

			const data = await wpcom.req.get( {
				path: '/users/me',
				apiNamespace: 'wp/v2',
			} );

			setProfileData( {
				username: data.username || '',
				displayName: data.name || '',
				email: data.email || '',
				siteAddress: data.url || '',
				aboutMe: data.description || '',
				isDeveloper: Boolean( data.meta?.is_developer ),
			} );
		} catch ( err ) {
			setError( err instanceof Error ? err.message : __( 'An unknown error occurred' ) );
		} finally {
			setLoading( false );
		}
	}, [] );

	const saveProfile = useCallback(
		async ( data: ProfileData ) => {
			try {
				setLoading( true );
				setError( null );

				await wpcom.req.post( {
					path: '/users/me',
					apiNamespace: 'wp/v2',
					body: {
						username: data.username,
						name: data.displayName,
						email: data.email,
						url: data.siteAddress,
						description: data.aboutMe,
						meta: {
							is_developer: data.isDeveloper,
						},
					},
				} );

				await fetchProfile();
			} catch ( err ) {
				setError( err instanceof Error ? err.message : __( 'An unknown error occurred' ) );
				throw err;
			} finally {
				setLoading( false );
			}
		},
		[ fetchProfile ]
	);

	useEffect( () => {
		fetchProfile();
	}, [ fetchProfile ] );

	return {
		loading,
		error,
		profileData,
		saveProfile,
	};
}

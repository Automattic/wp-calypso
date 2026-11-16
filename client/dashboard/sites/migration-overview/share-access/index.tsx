import {
	analyzeSiteMigrationSource,
	requestSiteMigrationHelp,
	saveSiteMigrationApplicationPassword,
	setupSiteMigrationAuthorization,
	shareSiteMigrationAccess,
} from '@automattic/api-core';
import {
	siteBySlugQuery,
	siteQueryFilter,
	siteWordPressMigrationStatusQuery,
} from '@automattic/api-queries';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
	__experimentalVStack as VStack,
	Button,
	TextControl,
	TextareaControl,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale } from '../../../app/locale';
import { ButtonStack } from '../../../components/button-stack';
import Notice from '../../../components/notice';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { Text } from '../../../components/text';
import { getSiteDisplayName } from '../../../utils/site-name';
import { MigrationCard } from '../wordpress/migration-card';
import { getMigrationAuthorizationUrl, takeMigrationAuthorization } from './authorization';
import type { Site } from '@automattic/api-core';
import type { FormEvent } from 'react';

function parseAccessUrl( value: string ) {
	try {
		const address = value.trim();
		const url = new URL( address.includes( '://' ) ? address : 'https://' + address );
		if (
			[ 'https:', 'http:' ].includes( url.protocol ) &&
			url.hostname.includes( '.' ) &&
			! url.username &&
			! url.password
		) {
			return url;
		}
	} catch {
		return null;
	}
	return null;
}

const LOGIN_FAILED = 'automated_migration_tools_login_and_get_cookies_test_failed';

function needsAccess( site: Site ) {
	return (
		site.site_migration.type === 'assisted-wordpress' && site.site_migration.status_v2 === 'pending'
	);
}

export function ShareAccessForm( { site, sourceUrl }: { site: Site; sourceUrl: string } ) {
	const locale = useLocale();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [ manual, setManual ] = useState( false );
	const [ notes, setNotes ] = useState( '' );
	const [ username, setUsername ] = useState( '' );
	const [ password, setPassword ] = useState( '' );
	const [ authorizationUrl, setAuthorizationUrl ] = useState( '' );
	const [ error, setError ] = useState( '' );
	const [ loginFailed, setLoginFailed ] = useState( false );
	const [ busy, setBusy ] = useState( false );
	const pending = useRef( false );
	const leaving = useRef( false );
	const verifiedSource = useRef< string | null >( null );
	const sourceAddress = parseAccessUrl( sourceUrl );
	const source = sourceAddress?.href;

	const returnToOverview = useCallback( async () => {
		if ( leaving.current ) {
			return;
		}
		leaving.current = true;
		await navigate( {
			to: '/sites/$siteSlug/migration-overview',
			params: { siteSlug: site.slug },
			replace: true,
		} );
	}, [ navigate, site.slug ] );

	const ensurePending = useCallback( async () => {
		const current = await queryClient.fetchQuery( {
			...siteBySlugQuery( site.slug ),
			staleTime: 0,
			retry: false,
		} );
		if ( current.ID === site.ID && needsAccess( current ) ) {
			return true;
		}
		await returnToOverview();
		return false;
	}, [ queryClient, returnToOverview, site.ID, site.slug ] );

	const finish = useCallback( async () => {
		await queryClient.invalidateQueries( siteQueryFilter( site.ID ) );
		await returnToOverview();
	}, [ queryClient, returnToOverview, site.ID ] );

	const run = useCallback( async ( action: () => Promise< void >, authorizationError?: string ) => {
		if ( pending.current ) {
			return;
		}
		pending.current = true;
		setBusy( true );
		setError( '' );
		try {
			await action();
		} catch ( reason ) {
			const code = ( reason as { code?: string } | undefined )?.code;
			let message;
			if ( authorizationError ) {
				message = authorizationError;
			} else if ( code === LOGIN_FAILED ) {
				setLoginFailed( true );
				message = __(
					'We couldn’t verify your credentials. Check your username and password and try again.'
				);
			} else if ( code === 'too_many_requests' ) {
				message = __(
					'You’ve already sent us several migration requests today. Our team will follow up by email on the ones we’ve received.'
				);
			} else if ( code === 'migration_request_not_submitted' ) {
				message = __(
					'We couldn’t submit your migration request automatically. Our team has been notified and will reach out by email.'
				);
			} else {
				message = __(
					'We couldn’t send your migration request just now. Please try again in a few minutes.'
				);
			}
			setError( message );
		} finally {
			pending.current = false;
			setBusy( false );
		}
	}, [] );

	useEffect( () => {
		if ( ! busy && ! needsAccess( site ) ) {
			void returnToOverview();
		}
	}, [ busy, returnToOverview, site ] );

	useEffect( () => {
		const result = takeMigrationAuthorization( site.ID );
		if ( ! result || leaving.current || result.source !== source ) {
			return;
		}
		verifiedSource.current = result.source;
		setAuthorizationUrl( result.authorizationUrl );
		setManual( false );
		const { credentials } = result;
		if ( ! credentials ) {
			setError( __( 'Authorize WordPress.com in your WP Admin or share your credentials.' ) );
			return;
		}

		void run( async () => {
			if ( ! ( await ensurePending() ) ) {
				return;
			}
			const { success } = await saveSiteMigrationApplicationPassword( site.ID, {
				...credentials,
				from_url: result.source,
			} );
			if ( ! success ) {
				throw new Error();
			}
			await finish();
		}, __( 'We couldn’t connect to your site. Try authorizing again or share your credentials.' ) );
	}, [ ensurePending, finish, run, site.ID, source ] );

	const openTicket = async ( source: string, context?: string ) => {
		const { success } = await requestSiteMigrationHelp( {
			locale,
			blog_url: site.slug,
			from_url: source,
			context,
		} );
		if ( ! success ) {
			throw new Error();
		}
	};

	const ensureSupportedSource = async ( address: string ) => {
		const info =
			verifiedSource.current === address ? null : await analyzeSiteMigrationSource( address );
		if ( ! ( await ensurePending() ) ) {
			return false;
		}
		const isWpcom = info?.platform_data?.is_wpcom;
		if ( isWpcom || ( info?.platform && info.platform !== 'wordpress' ) ) {
			await openTicket( address, isWpcom ? undefined : 'site_is_not_wordpress' );
			setError(
				isWpcom
					? __( 'This site is already on WordPress.com. Ask our team for help.' )
					: __( 'Our migration service is for WordPress sites. Ask our team for help.' )
			);
			return false;
		}
		verifiedSource.current = address;
		return true;
	};

	const chooseAccess = ( useAuthorization: boolean ) =>
		void run( async () => {
			if ( ! source || ! ( await ensureSupportedSource( source ) ) ) {
				return;
			}
			if ( useAuthorization ) {
				let nextAuthorizationUrl = authorizationUrl;
				if ( ! nextAuthorizationUrl ) {
					try {
						nextAuthorizationUrl =
							( await setupSiteMigrationAuthorization( site.ID, source ) ).authorization_url ?? '';
					} catch ( reason ) {
						if (
							( reason as { code?: string } | undefined )?.code !==
							'failed_to_get_authorization_path'
						) {
							throw reason;
						}
					}
				}
				if ( nextAuthorizationUrl ) {
					try {
						const url = getMigrationAuthorizationUrl( site.ID, source, nextAuthorizationUrl );
						if ( url ) {
							window.location.assign( url.href );
							return;
						}
					} catch {
						// If authorization cannot start, the customer can share credentials instead.
					}
				}
				setAuthorizationUrl( '' );
			}
			setManual( true );
		} );

	const submit = ( event: FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		void run( async () => {
			if ( ! source || ! ( await ensureSupportedSource( source ) ) ) {
				return;
			}
			const { success } = await shareSiteMigrationAccess( site.ID, site.slug, locale, {
				migration_type: 'credentials',
				from_url: source,
				username,
				password,
				notes,
				bypass_verification: loginFailed,
			} );
			if ( ! success ) {
				throw new Error();
			}
			setPassword( '' );
			await finish();
		} );
	};

	const resetCredentialError = () => {
		setError( '' );
		setLoginFailed( false );
	};

	const goBack = () => {
		resetCredentialError();
		setPassword( '' );
		if ( manual ) {
			setManual( false );
		} else {
			void returnToOverview();
		}
	};

	const sourceLabel = sourceAddress
		? sourceAddress.host + sourceAddress.pathname.replace( /\/$/, '' )
		: '';
	const copy = manual
		? {
				title: __( 'Securely share your credentials' ),
				description: sprintf(
					/* translators: %s is the address of the site being migrated. */
					__( 'Enter your WordPress admin login details so our team can temporarily access %s.' ),
					sourceLabel
				),
			}
		: {
				title: __( 'Authorize access to your WordPress site' ),
				description: sourceLabel
					? sprintf(
							/* translators: %s is the address of the site being migrated. */
							__( 'Authorize WordPress.com in the WordPress admin for %s.' ),
							sourceLabel
						)
					: undefined,
			};
	const help = source && (
		<Button
			__next40pxDefaultSize
			variant="link"
			disabled={ busy }
			onClick={ () =>
				void run( async () => {
					if ( ! ( await ensurePending() ) ) {
						return;
					}
					await openTicket( source, 'help_requested' );
					await finish();
				} )
			}
		>
			{ __( 'Have our team email you' ) }
		</Button>
	);

	return (
		<MigrationCard
			{ ...copy }
			back={ { label: __( 'Back' ), onClick: goBack, disabled: busy } }
			note={ help }
		>
			{ ! source && (
				<Notice
					variant="error"
					title={ __(
						'We couldn’t find a valid source site for this migration. Return to the migration overview for help.'
					) }
				/>
			) }
			{ error && <Notice variant="error" title={ error } /> }
			{ ! manual ? (
				<ButtonStack justify="flex-start" wrap>
					<Button
						__next40pxDefaultSize
						variant="primary"
						onClick={ () => chooseAccess( true ) }
						disabled={ busy || ! source }
					>
						{ __( 'Authorize access' ) }
					</Button>
					<Button
						__next40pxDefaultSize
						variant="link"
						disabled={ busy || ! source }
						onClick={ () => chooseAccess( false ) }
					>
						{ __( 'Share credentials instead' ) }
					</Button>
				</ButtonStack>
			) : (
				<form onSubmit={ submit }>
					<VStack spacing={ 4 }>
						<TextControl
							__next40pxDefaultSize
							label={ __( 'WordPress admin username' ) }
							value={ username }
							onChange={ ( value ) => {
								setUsername( value );
								resetCredentialError();
							} }
							disabled={ busy }
							required
						/>
						<TextControl
							__next40pxDefaultSize
							label={ __( 'Password' ) }
							type="password"
							autoComplete="off"
							value={ password }
							onChange={ ( value ) => {
								setPassword( value );
								resetCredentialError();
							} }
							disabled={ busy }
							required
						/>
						<details>
							<summary>{ __( 'Special instructions' ) }</summary>
							<TextareaControl
								label={ __(
									'Share any other details that will help us access your site for the migration.'
								) }
								help={ __(
									"Please don't share any passwords or secure information in this field. We'll reach out to collect that information if you have any additional credentials to access your site."
								) }
								maxLength={ 1000 }
								value={ notes }
								onChange={ setNotes }
								disabled={ busy }
							/>
						</details>
						<Button
							__next40pxDefaultSize
							type="submit"
							variant="primary"
							isBusy={ busy }
							disabled={ busy }
						>
							{ loginFailed ? __( 'Continue anyway' ) : __( 'Continue' ) }
						</Button>
					</VStack>
				</form>
			) }
			{ busy && ! manual && <Text role="status">{ __( 'Connecting to your site…' ) }</Text> }
		</MigrationCard>
	);
}

export default function ShareAccess( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: migration } = useSuspenseQuery( siteWordPressMigrationStatusQuery( site.ID ) );
	return (
		<PageLayout size="small" header={ <PageHeader title={ getSiteDisplayName( site ) } /> }>
			<ShareAccessForm
				key={ `${ site.ID }:${ migration.source_url }` }
				site={ site }
				sourceUrl={ migration.source_url ?? '' }
			/>
		</PageLayout>
	);
}

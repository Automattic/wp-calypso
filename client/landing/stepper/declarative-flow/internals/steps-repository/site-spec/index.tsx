import config from '@automattic/calypso-config';
import { getSessionId as getPostHogSessionId } from '@automattic/posthog';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useRef, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useExperiment } from 'calypso/lib/explat';
import { useSiteSpec } from 'calypso/lib/site-spec';
import { getCiabSiteSpecConfig, type SiteSpecConfig } from 'calypso/lib/site-spec/utils';
import { VEGA_EXPERIMENT_NAME, getVegaSiteSpecConfig } from 'calypso/lib/site-spec/vega';
import wpcom from 'calypso/lib/wp';
import type { Step as StepType } from '../../types';

type EffectiveVariation = 'control' | 'treatment';

function hasStatus( error: unknown, status: number ): boolean {
	if ( ! error || typeof error !== 'object' ) {
		return false;
	}
	const record = error as Record< string, unknown >;
	return record.status === status || record.statusCode === status;
}

const SiteSpec: StepType = function SiteSpec() {
	const translate = useTranslate();
	const queryParams = useQuery();
	const querySource = queryParams.get( 'source' );
	const isCiab = !! querySource && querySource.startsWith( 'ciab-' );

	// The Vega experiment is scoped to the standard AI Site Builder flow. CIAB
	// runs its own tailored site-spec config and is excluded from the split.
	const [ , experimentAssignment ] = useExperiment( VEGA_EXPERIMENT_NAME, {
		isEligible: ! isCiab,
	} );
	const assignedVariation: EffectiveVariation =
		experimentAssignment?.variationName === 'treatment' ? 'treatment' : 'control';

	// Session-sticky fallback to control, flipped when the server rejects the
	// first treatment request (e.g. the user was not enrolled as treatment).
	const [ forceControl, setForceControl ] = useState( false );
	const effectiveVariation: EffectiveVariation =
		forceControl || isCiab ? 'control' : assignedVariation;

	const siteCreationPromiseRef = useRef< Promise< number | null > | null >( null );
	const messageCountRef = useRef( 0 );
	const firstRequestRef = useRef( true );
	const isSubmittingRef = useRef( false );

	const handleCiabMessage = useCallback( () => {
		messageCountRef.current += 1;
		if ( messageCountRef.current !== 1 ) {
			return;
		}
		siteCreationPromiseRef.current = ( async () => {
			try {
				const response = ( await wpcom.req.post(
					{
						path: '/sites/new',
						apiVersion: '1.1',
					},
					{},
					{
						client_id: config( 'wpcom_signup_id' ),
						client_secret: config( 'wpcom_signup_key' ),
						garden_name: 'commerce',
						garden_partner_name: 'woo',
						blog_title: '',
						blog_name: '',
						options: {
							site_creation_flow: 'ai-site-builder',
							trigger_backend_build: false,
						},
					}
				) ) as { blog_details: { blogid: number } };

				return response?.blog_details?.blogid ?? null;
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.error( 'Failed to create garden site:', error );
				return null;
			}
		} )();
	}, [] );

	const handleCiabSpecConfirm = useCallback( async ( specData: unknown ) => {
		if ( isSubmittingRef.current ) {
			return;
		}

		isSubmittingRef.current = true;

		const sessionId =
			specData && typeof specData === 'object' && 'session_id' in specData
				? ( specData as { session_id?: string } ).session_id
				: undefined;
		const specId = sessionId || '';
		const blogId = siteCreationPromiseRef.current ? await siteCreationPromiseRef.current : null;

		let url = `/setup/ai-site-builder/?create_garden_site=1&trigger_backend_build=0&spec_id=${ encodeURIComponent(
			specId
		) }`;
		if ( blogId ) {
			url += `&early_created_site=${ encodeURIComponent( blogId ) }`;
		}

		const phSessionId = getPostHogSessionId();
		if ( phSessionId ) {
			url += `&_ph=${ encodeURIComponent( phSessionId ) }`;
		}

		window.location.href = url;
	}, [] );

	// Track experiment-aware widget events (chip / free-text / spec-confirm
	// accept & reject). The widget additionally carries the variation via the
	// `tracking.getOverrides` hook below.
	const handleVegaMessage = useCallback(
		( message: unknown ) => {
			if ( ! message || typeof message !== 'object' ) {
				return;
			}
			const { type, ...rest } = message as { type?: string } & Record< string, unknown >;
			switch ( type ) {
				case 'prompt_chip_selected':
					recordTracksEvent( 'calypso_vega_site_spec_chip_selected', {
						experiment_variation: effectiveVariation,
						chip_label: typeof rest.label === 'string' ? rest.label : undefined,
					} );
					break;
				case 'prompt_submitted':
					recordTracksEvent( 'calypso_vega_site_spec_prompt_submitted', {
						experiment_variation: effectiveVariation,
						from_chip: rest.from_chip === true,
					} );
					break;
				case 'spec_confirm_accepted':
					recordTracksEvent( 'calypso_vega_site_spec_spec_confirm_accepted', {
						experiment_variation: effectiveVariation,
					} );
					break;
				case 'spec_confirm_rejected':
					recordTracksEvent( 'calypso_vega_site_spec_spec_confirm_rejected', {
						experiment_variation: effectiveVariation,
					} );
					break;
			}
		},
		[ effectiveVariation ]
	);

	const handleTreatmentError = useCallback( ( error: unknown ) => {
		// A 403 on the first treatment request means the server did not accept
		// the assignment (e.g. the user was not enrolled as treatment). Per
		// the spec we fall back to control for the session and never retry
		// `vega-site-spec`.
		if ( firstRequestRef.current && hasStatus( error, 403 ) ) {
			firstRequestRef.current = false;
			recordTracksEvent( 'calypso_vega_site_spec_fallback_to_control', {
				reason: '403',
			} );
			setForceControl( true );
			return;
		}
		firstRequestRef.current = false;
	}, [] );

	const siteSpecConfig = useMemo< SiteSpecConfig | undefined >( () => {
		if ( isCiab ) {
			return getCiabSiteSpecConfig();
		}
		if ( effectiveVariation !== 'treatment' ) {
			// Control keeps the pre-experiment behaviour byte-identical: let
			// `useSiteSpec` fall back to `getDefaultSiteSpecConfig()` so the
			// widget sees the same payload it did before the split.
			return undefined;
		}
		return {
			...getVegaSiteSpecConfig(),
			tracking: {
				enabled: true,
				prefix: 'jetpack_calypso',
				getOverrides: () => ( {
					client: 'calypso',
					experiment_variation: 'treatment',
					assigned_variation: assignedVariation,
				} ),
			},
		};
	}, [ isCiab, effectiveVariation, assignedVariation ] );

	// eslint-disable-next-line no-nested-ternary
	const onMessage = isCiab
		? handleCiabMessage
		: effectiveVariation === 'treatment'
		? handleVegaMessage
		: undefined;

	useSiteSpec( {
		siteSpecConfig,
		onMessage,
		onSpecConfirm: isCiab ? handleCiabSpecConfirm : undefined,
		onError: effectiveVariation === 'treatment' ? handleTreatmentError : undefined,
	} );

	// The widget container is rendered unconditionally (matching pre-experiment
	// behaviour). While the ExPlat assignment is still loading, the widget
	// boots on the control agent (`site-spec`). If the user resolves to
	// treatment, `key={ effectiveVariation }` forces a remount so the widget
	// re-initialises against `vega-site-spec`. The same key flip handles the
	// 403 fallback from treatment back to control mid-session.
	return (
		<>
			<DocumentHead title={ translate( 'Build Your Site with AI' ) } />
			<div key={ effectiveVariation } id="site-spec-container" style={ { height: '100vh' } } />
		</>
	);
};

export default SiteSpec;

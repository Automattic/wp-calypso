import { __ } from '@wordpress/i18n';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	applyRedesign,
	fetchRedesign,
	fetchRedesignPreview,
	generateRedesign,
	getCheckoutUrl,
	restartRedesign,
	rollbackRedesign,
	startRedesign,
} from './api';
import type { Redesign, RedesignPreview } from './api';

const POLL_BACKOFF_MAX = 30000;
const RESTARTABLE_STATUSES = [ 'interview', 'preview_ready', 'failed', 'applied', 'rolled_back' ];
const MAX_SUCCESSOR_HOPS = 3;

/** Whether the user can start over; generation and apply must finish first. */
export function canRestart( run: Redesign | null ): boolean {
	if ( ! run ) {
		return false;
	}
	return run.can_restart ?? ( RESTARTABLE_STATUSES.includes( run.status ) && ! run.successor_id );
}

/** Follows a superseded run to the fresh run that replaced it. */
async function followSuccessor( siteId: number, start: Redesign ): Promise< Redesign > {
	let current = start;
	for ( let hops = 0; hops < MAX_SUCCESSOR_HOPS && current.successor_id; hops++ ) {
		current = await fetchRedesign( siteId, current.successor_id );
	}
	return current;
}

function setRunUrl( id: string ) {
	const url = new URL( window.location.href );
	url.searchParams.set( 'redesign', id );
	url.searchParams.delete( 'resume' );
	window.history.replaceState( window.history.state, '', url );
}

/** A run replaced by a fresh one; the agent conversation belongs to `from` until it is reset. */
export type RedesignSuccession = { from: string; to: string };

/** Active work polls faster; failed polls back off so a flaky connection is not hammered. */
function pollDelay( status: string, failures: number ): number {
	if ( failures > 0 ) {
		return Math.min( POLL_BACKOFF_MAX, 5000 * 2 ** ( failures - 1 ) );
	}
	return [ 'generating', 'applying' ].includes( status ) ? 3000 : 5000;
}

/**
 * Owns the run and drops requests that finish after the workspace changes sites or unmounts.
 * With `applyOnly` (back from a paid checkout), only the run in the URL may be used: no run is
 * started, restarted, generated, or followed to a successor; `closed` is set instead.
 */
export function useRedesign( siteId: number, { applyOnly = false }: { applyOnly?: boolean } = {} ) {
	const [ run, setRun ] = useState< Redesign | null >( null );
	const [ error, setError ] = useState< string | null >( null );
	const [ busy, setBusy ] = useState( false );
	const [ path, setPath ] = useState( '/' );
	const [ preview, setPreview ] = useState< RedesignPreview | null >( null );
	const [ previewError, setPreviewError ] = useState( false );
	// Failed polls in a row. A failure leaves `run` unchanged, so this is what schedules the retry.
	const [ pollFailures, setPollFailures ] = useState( 0 );
	const [ succession, setSuccession ] = useState< RedesignSuccession | null >( null );
	// Bumped when an action settles, so a poll dropped as stale while it ran is rescheduled.
	const [ pollEpoch, setPollEpoch ] = useState( 0 );
	const [ closed, setClosed ] = useState( false );
	const scope = useMemo( () => ( { active: false, siteId } ), [ siteId ] );
	const actionSequence = useRef( 0 );
	const actionInFlight = useRef< { scope: typeof scope; sequence: number } | null >( null );
	const previewGenerationId = run?.generation?.id;
	const previewRunId = run?.id;
	const canPreviewGeneration =
		!! run && [ 'preview_ready', 'applying', 'applied' ].includes( run.status );

	useEffect( () => {
		scope.active = true;
		setRun( null );
		setPath( '/' );
		setSuccession( null );
		return () => {
			scope.active = false;
		};
	}, [ scope ] );

	const acceptRun = useCallback(
		( next: Redesign ) => {
			if ( next.site_id !== siteId ) {
				throw new Error( 'The redesign belongs to a different site.' );
			}
			setRun( next );
		},
		[ siteId ]
	);

	/** Moves the workspace to a fresh run; nothing from the old run carries over. */
	const switchRun = useCallback(
		( next: Redesign, fromId: string ) => {
			if ( applyOnly ) {
				setClosed( true );
				return;
			}
			acceptRun( next );
			setPath( '/' );
			setError( null );
			setPollFailures( 0 );
			setRunUrl( next.id );
			setSuccession( { from: fromId, to: next.id } );
		},
		[ acceptRun, applyOnly ]
	);

	const load = useCallback( async () => {
		const sequence = ++actionSequence.current;
		setError( null );
		setBusy( true );
		try {
			const id = new URLSearchParams( window.location.search ).get( 'redesign' );
			if ( applyOnly && ! id ) {
				setClosed( true );
				return;
			}
			let next: Redesign;
			try {
				next = id ? await fetchRedesign( siteId, id ) : await startRedesign( siteId );
			} catch ( failure ) {
				const response = failure as {
					code?: string;
					error?: string;
					status?: number;
					statusCode?: number;
				};
				if ( ! id || ( response.code ?? response.error ) !== 'site_redesign_not_found' ) {
					throw failure;
				}
				if ( ! scope.active || sequence !== actionSequence.current ) {
					return;
				}
				if ( applyOnly ) {
					setClosed( true );
					return;
				}
				const url = new URL( window.location.href );
				url.searchParams.delete( 'redesign' );
				url.searchParams.delete( 'resume' );
				window.history.replaceState( window.history.state, '', url );
				next = await startRedesign( siteId );
			}
			if ( ! scope.active || sequence !== actionSequence.current ) {
				return;
			}
			if ( next.successor_id ) {
				const requestedId = next.id;
				next = await followSuccessor( siteId, next );
				if ( ! scope.active || sequence !== actionSequence.current ) {
					return;
				}
				switchRun( next, requestedId );
				return;
			}
			acceptRun( next );
			const url = new URL( window.location.href );
			url.searchParams.set( 'redesign', next.id );
			window.history.replaceState( window.history.state, '', url );
		} catch {
			if ( scope.active && sequence === actionSequence.current ) {
				setError( __( 'Unable to open this redesign. Check your permissions and try again.' ) );
			}
		} finally {
			if ( scope.active && sequence === actionSequence.current ) {
				setBusy( false );
			}
		}
	}, [ acceptRun, applyOnly, switchRun, scope, siteId ] );
	useEffect( () => {
		void load();
	}, [ load ] );

	useEffect( () => {
		if (
			! run ||
			// The agent starts or retries generation from the chat, so a waiting run keeps polling.
			( ! [ 'interview', 'preview_ready', 'failed', 'generating', 'applying' ].includes(
				run.status
			) &&
				// The agent can also start over from a finished run.
				! canRestart( run ) )
		) {
			return;
		}
		let cancelled = false;
		const sequence = actionSequence.current;
		const timer = setTimeout(
			async () => {
				try {
					let next = await fetchRedesign( siteId, run.id );
					// The agent started over: move to the fresh run it created.
					if ( next.successor_id ) {
						next = await followSuccessor( siteId, next );
						if ( ! cancelled && scope.active && sequence === actionSequence.current ) {
							++actionSequence.current;
							switchRun( next, run.id );
						}
						return;
					}
					if ( ! cancelled && scope.active && sequence === actionSequence.current ) {
						acceptRun( next );
						setError( null );
						setPollFailures( 0 );
					}
				} catch {
					if ( ! cancelled && scope.active && sequence === actionSequence.current ) {
						setError( __( 'Unable to check design progress. Try loading your design again.' ) );
						setPollFailures( ( count ) => count + 1 );
					}
				}
			},
			pollDelay( run.status, pollFailures )
		);
		return () => {
			cancelled = true;
			clearTimeout( timer );
		};
	}, [ acceptRun, switchRun, run, siteId, scope, pollFailures, pollEpoch ] );

	useEffect( () => {
		setPreview( null );
		setPreviewError( false );
		if ( ! previewRunId || ! previewGenerationId || ! canPreviewGeneration ) {
			return;
		}
		let cancelled = false;
		const previewRun = {
			id: previewRunId,
			site_id: siteId,
			generation: { id: previewGenerationId },
		};
		fetchRedesignPreview( previewRun, path )
			.then( ( next ) => {
				if ( ! cancelled && next.generation_id === previewGenerationId && next.path === path ) {
					setPreview( next );
				}
			} )
			.catch( () => {
				if ( ! cancelled ) {
					setPreviewError( true );
				}
			} );
		return () => {
			cancelled = true;
		};
	}, [ path, siteId, previewRunId, previewGenerationId, canPreviewGeneration ] );

	const performAction = async (
		action: () => Promise< Redesign >,
		actionName: 'generate' | 'apply' | 'rollback'
	) => {
		if ( ! scope.active || actionInFlight.current?.scope === scope ) {
			return;
		}
		const sequence = ++actionSequence.current;
		const inFlight = { scope, sequence };
		actionInFlight.current = inFlight;
		setBusy( true );
		setError( null );
		try {
			const next = await action();
			if ( scope.active && sequence === actionSequence.current ) {
				acceptRun( next );
			}
		} catch ( failure ) {
			if ( ! scope.active || sequence !== actionSequence.current ) {
				return;
			}
			const checkout = actionName === 'apply' ? getCheckoutUrl( failure ) : null;
			const response = failure as { code?: string; error?: string };
			if ( ( response.code ?? response.error ) === 'site_redesign_busy' && run ) {
				try {
					const latest = await fetchRedesign( siteId, run.id );
					if ( scope.active && sequence === actionSequence.current ) {
						acceptRun( latest );
					}
				} catch {
					if ( scope.active && sequence === actionSequence.current ) {
						setError( __( 'Unable to check design progress. Try loading your design again.' ) );
					}
				}
				return;
			}
			if ( ( response.code ?? response.error ) === 'site_redesign_brief_stale' ) {
				if ( run ) {
					let latest: Redesign;
					try {
						latest = await fetchRedesign( siteId, run.id );
					} catch {
						if ( scope.active && sequence === actionSequence.current ) {
							setError(
								__( 'Unable to refresh your design brief. Try loading the workspace again.' )
							);
						}
						return;
					}
					if ( scope.active && sequence === actionSequence.current ) {
						acceptRun( latest );
						setError(
							__( 'Your design brief changed. Review the latest brief before generating.' )
						);
					}
				}
				return;
			}
			if ( checkout ) {
				window.location.assign( checkout );
				return;
			}
			const messages = {
				apply: __(
					'Unable to use this design. Your site may have changed; review it and try again.'
				),
				rollback: __( 'Unable to restore your previous design. Please try again.' ),
				generate: __( 'Unable to generate your design. Please try again.' ),
			};
			setError( messages[ actionName ] );
		} finally {
			if ( actionInFlight.current === inFlight ) {
				actionInFlight.current = null;
			}
			if ( scope.active && sequence === actionSequence.current ) {
				setBusy( false );
				setPollEpoch( ( epoch ) => epoch + 1 );
			}
		}
	};
	const restart = async () => {
		if (
			applyOnly ||
			! run ||
			! canRestart( run ) ||
			! scope.active ||
			actionInFlight.current?.scope === scope
		) {
			return;
		}
		const sequence = ++actionSequence.current;
		const inFlight = { scope, sequence };
		actionInFlight.current = inFlight;
		const isCurrent = () => scope.active && sequence === actionSequence.current;
		setBusy( true );
		setError( null );
		try {
			// Idempotent: a run the agent already restarted answers with its latest successor.
			const next = await restartRedesign( run );
			if ( isCurrent() ) {
				switchRun( next, run.id );
			}
		} catch ( failure ) {
			if ( ! isCurrent() ) {
				return;
			}
			const response = failure as { code?: string; error?: string };
			if ( ( response.code ?? response.error ) === 'site_redesign_busy' ) {
				setError( __( 'Wait for the current design work to finish before starting a new brief.' ) );
				try {
					const latest = await fetchRedesign( siteId, run.id );
					if ( isCurrent() ) {
						acceptRun( latest );
					}
				} catch {}
				return;
			}
			setError(
				( response.code ?? response.error ) === 'site_redesign_closed'
					? __( 'This redesign has closed. Reload the page to continue with your latest one.' )
					: __( 'Unable to start a new brief. Please try again.' )
			);
		} finally {
			if ( actionInFlight.current === inFlight ) {
				actionInFlight.current = null;
			}
			if ( isCurrent() ) {
				setBusy( false );
				setPollEpoch( ( epoch ) => epoch + 1 );
			}
		}
	};
	return {
		run,
		succession,
		restart,
		closed,
		brief: run?.brief_draft ?? run?.brief ?? null,
		error,
		busy,
		path,
		setPath,
		preview,
		previewError,
		load,
		generate: () =>
			! applyOnly && run && run.brief_draft && run.brief_revision > 0
				? performAction( () => generateRedesign( run ), 'generate' )
				: Promise.resolve(),
		apply: ( allowSourceChanges = false ) =>
			run
				? performAction( () => applyRedesign( run, allowSourceChanges ), 'apply' )
				: Promise.resolve(),
		rollback: () =>
			run ? performAction( () => rollbackRedesign( run ), 'rollback' ) : Promise.resolve(),
	};
}

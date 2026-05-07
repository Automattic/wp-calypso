import { Button } from '@wordpress/components';
import { Icon, copy } from '@wordpress/icons';
import { useEffect, useMemo, useState } from 'react';
import { exPlatDevtools } from 'calypso/lib/explat';
import FlagRow from './flag-row';
import type { ExPlatSdk } from '@automattic/explat-client';

type ForcedMap = Record< string, ExPlatSdk.FeatureValue >;

/**
 * Returns the union of (a) flags the SDK has fetched in its payload and
 * (b) flags the dev has manually forced. Forced-only flags would otherwise
 * be invisible because the panel hadn't seen them in `/flags` yet.
 */
function getDisplayFlags( forced: ForcedMap ): string[] {
	const known = new Set< string >( exPlatDevtools.getKnownFlags() );
	for ( const key of Object.keys( forced ) ) {
		known.add( key );
	}
	return Array.from( known ).sort();
}

/**
 * The wire payload ships experiment ranges as a parallel `ranges` array on
 * the rule, but our canonical schema (and downstream validators) want each
 * variation to carry its own inline `range`. Splice the parallel array into
 * the variations and drop the top-level `ranges` so copy output matches the
 * canonical shape.
 */
function inlineRangesIntoVariations( feature: unknown ): unknown {
	if ( ! feature || typeof feature !== 'object' ) {
		return feature;
	}
	const f = feature as Record< string, unknown >;
	const rules = Array.isArray( f.rules ) ? f.rules : null;
	if ( ! rules ) {
		return feature;
	}
	return {
		...f,
		rules: rules.map( ( rawRule ) => {
			if ( ! rawRule || typeof rawRule !== 'object' ) {
				return rawRule;
			}
			const rule = rawRule as Record< string, unknown >;
			if ( rule.type !== 'experiment' || ! Array.isArray( rule.ranges ) ) {
				return rule;
			}
			const { ranges, variations: rawVariations, ...rest } = rule;
			const variations = Array.isArray( rawVariations ) ? rawVariations : [];
			return {
				...rest,
				variations: variations.map( ( v, i ) => ( {
					...( v as Record< string, unknown > ),
					range: ( ranges as unknown[] )[ i ] ?? [ 0, 0 ],
				} ) ),
			};
		} ),
	};
}

export default function ExPlatHelperPanel() {
	const [ forced, setForced ] = useState< ForcedMap >( () =>
		exPlatDevtools.forcedFeatures.snapshot()
	);
	// Bumping this state value re-renders all flag rows so they re-call
	// `previewFeatureValue` — used after "Reset all" / per-flag clear, and
	// after a successful Refresh fetch.
	const [ refreshTick, setRefreshTick ] = useState( 0 );
	const [ isRefreshing, setIsRefreshing ] = useState( false );

	useEffect( () => {
		return exPlatDevtools.forcedFeatures.subscribe( () => {
			setForced( exPlatDevtools.forcedFeatures.snapshot() );
		} );
	}, [] );

	// Prefetch the /flags payload on mount. Without this, the flag list stays
	// empty until some component calls `getFeatureValue` — which on most pages
	// never happens, so the panel sits on the empty-state message forever.
	useEffect( () => {
		let cancelled = false;
		void exPlatDevtools.loadFlags().then( () => {
			if ( ! cancelled ) {
				setRefreshTick( ( t ) => t + 1 );
			}
		} );
		return () => {
			cancelled = true;
		};
	}, [] );

	const onRefresh = async () => {
		setIsRefreshing( true );
		try {
			await exPlatDevtools.loadFlags( { force: true } );
		} finally {
			setIsRefreshing( false );
			setRefreshTick( ( t ) => t + 1 );
		}
	};

	const displayFlags = useMemo( () => getDisplayFlags( forced ), [ forced, refreshTick ] );
	const forcedCount = Object.keys( forced ).length;
	const [ copyState, setCopyState ] = useState< 'idle' | 'copied' | 'failed' >( 'idle' );

	const onCopyAllJson = async () => {
		// Build `{ <flagKey>: Feature, ... }` for every known flag so the
		// output matches the `flags` map shape in the /flags payload (the
		// shape validators expect).
		const entries: Record< string, unknown > = {};
		for ( const key of displayFlags ) {
			const raw = exPlatDevtools.getRawFeature( key );
			if ( raw !== null ) {
				entries[ key ] = inlineRangesIntoVariations( raw );
			}
		}
		if ( Object.keys( entries ).length === 0 ) {
			setCopyState( 'failed' );
			setTimeout( () => setCopyState( 'idle' ), 1500 );
			return;
		}
		try {
			await navigator.clipboard.writeText( JSON.stringify( entries, null, 2 ) );
			setCopyState( 'copied' );
		} catch {
			setCopyState( 'failed' );
		}
		setTimeout( () => setCopyState( 'idle' ), 1500 );
	};

	const copyTitle = ( () => {
		if ( copyState === 'copied' ) {
			return 'Copied!';
		}
		if ( copyState === 'failed' ) {
			return 'Copy failed';
		}
		return 'Copy all flag JSON';
	} )();

	return (
		<>
			<div className="explat-helper__menu-item">
				ExPlat
				{ forcedCount > 0 && (
					<span
						className="explat-helper__forced-badge"
						title={ `${ forcedCount } flag${ forcedCount === 1 ? '' : 's' } forced` }
					>
						{ forcedCount }
					</span>
				) }
			</div>
			<div className="explat-helper__popover">
				<div className="explat-helper__header">
					<strong>ExPlat dev toggle</strong>
					<div className="explat-helper__header-right">
						<span className="explat-helper__count">
							{ displayFlags.length } flag{ displayFlags.length === 1 ? '' : 's' }
						</span>
						<Button
							variant="tertiary"
							size="small"
							onClick={ onCopyAllJson }
							disabled={ displayFlags.length === 0 }
							className={ `explat-helper__copy-all${
								copyState !== 'idle' ? ` is-${ copyState }` : ''
							}` }
							title={ copyTitle }
							label={ copyTitle }
							icon={ <Icon icon={ copy } size={ 16 } /> }
						/>
					</div>
				</div>
				{ displayFlags.length === 0 ? (
					<p className="explat-helper__empty">
						{ isRefreshing
							? 'Loading flags…'
							: 'No flags found. Click Refresh to fetch /flags/calypso, or check the console for fetch errors.' }
					</p>
				) : (
					<ul className="explat-helper__flag-list">
						{ displayFlags.map( ( flagKey ) => (
							<FlagRow
								key={ `${ flagKey }-${ refreshTick }` }
								flagKey={ flagKey }
								forcedValue={ forced[ flagKey ] }
								isForced={ flagKey in forced }
							/>
						) ) }
					</ul>
				) }
				<div className="explat-helper__footer">
					<Button
						variant="tertiary"
						size="small"
						disabled={ forcedCount === 0 }
						onClick={ () => exPlatDevtools.forcedFeatures.clearAll() }
					>
						Reset all
					</Button>
					<Button
						variant="tertiary"
						size="small"
						onClick={ onRefresh }
						isBusy={ isRefreshing }
						disabled={ isRefreshing }
					>
						Refresh
					</Button>
				</div>
			</div>
		</>
	);
}

import { SelectControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useSyncExternalStore } from 'react';
import {
	PORTFOLIO_DIRECTIONS,
	isPortfolioIllustrationVariant,
} from '../sites/site-wizard/portfolio-variants';
import {
	SITE_ACCESS_VARIANTS,
	isSiteAccessIllustrationVariant,
} from '../sites/site-wizard/site-access-variants';
import FloatingPreviewPanel, { usePreviewPanelSettings } from './floating-panel';
import FlowMap from './flow-map';
import './style.scss';
import type { PortfolioIllustrationVariant } from '../sites/site-wizard/portfolio-variants';
import type { SiteAccessIllustrationVariant } from '../sites/site-wizard/site-access-variants';
import type { WizardJump } from '../sites/site-wizard/use-site-wizard';
import type { AgencySite, MigrationCommissionSite } from '@automattic/api-core';

const enabled = process.env.NODE_ENV === 'development';
const listeners = new Set< () => void >();
const subscribe = ( listener: () => void ) => {
	listeners.add( listener );
	return () => {
		listeners.delete( listener );
	};
};
const statuses = [ 'pending', 'verified', 'paid', 'ineligible', 'reverification', 'rejected' ];
export const sampleSites: AgencySite[] = Array.from( { length: 24 }, ( _, index ) => ( {
	blog_id: -1000 - index,
	a4a_site_id: -1000 - index,
	url: [ 'automattic.com', 'wordpress.com', 'jetpack.com', 'woocommerce.com' ][ index % 4 ],
	url_with_scheme: `https://${ [ 'automattic.com', 'wordpress.com', 'jetpack.com', 'woocommerce.com' ][ index % 4 ] }`,
	blogname: [ 'Automattic', 'WordPress.com', 'Jetpack', 'WooCommerce' ][ index % 4 ],
	is_atomic: index % 2 === 0,
	hosting_provider_guess: index % 2 === 0 ? 'WordPress.com' : 'Pressable',
} ) );
const commissionSite = ( index: number, status: string ): MigrationCommissionSite => ( {
	id: sampleSites[ index ].a4a_site_id!,
	blog_id: sampleSites[ index ].blog_id,
	url: sampleSites[ index ].url,
	created_at: Math.floor( Date.now() / 1000 ) - index * 86400,
	state: 'active',
	tags: [ { name: 'a4a_self_migrated_site' } ],
	incentive_status: status,
	incentive_rejection_reason:
		status === 'ineligible' || status === 'rejected'
			? 'Example: this site was migrated outside the promotion window.'
			: undefined,
} );
let snapshot = {
	sites: 'live',
	siteRows: [] as AgencySite[],
	sitesRevision: 0,
	migrations: 'live',
	canTag: true,
	candidates: '2',
	tagged: [] as MigrationCommissionSite[],
	plugMotionReplay: 0,
	portfolioIllustration: 'connected' as PortfolioIllustrationVariant,
	siteAccessIllustration: 'menu' as SiteAccessIllustrationVariant,
	wizardJump: null as WizardJump | null,
	wizardPosition: null as WizardJump | null,
};
const getSnapshot = () => snapshot;
function update( changes: Partial< typeof snapshot > ) {
	snapshot = { ...snapshot, ...changes };
	listeners.forEach( ( listener ) => listener() );
}
const PRESET_STORAGE_KEY = 'a4a-sites-migrations-presets-v2';
const PRESETS = {
	sites: [ 'live', '0', '1', '2', '24', 'loading' ],
	migrations: [ 'live', 'empty', 'one', 'two', 'many', 'mixed', 'loading' ],
};
export function setPreviewPreset( surface: 'sites' | 'migrations', value: string ) {
	if ( ! PRESETS[ surface ].includes( value ) ) {
		return;
	}
	if ( surface === 'sites' ) {
		update( {
			sites: value,
			siteRows: sampleSites.slice( 0, Number( value ) || 0 ),
			sitesRevision: snapshot.sitesRevision + 1,
			wizardJump: null,
			wizardPosition: null,
		} );
		return;
	}
	let tagged: MigrationCommissionSite[] = [];
	if ( value === 'one' ) {
		tagged = [ commissionSite( 0, 'pending' ) ];
	}
	if ( value === 'two' || value === 'many' ) {
		tagged = Array.from( { length: value === 'two' ? 2 : 24 }, ( _, index ) =>
			commissionSite( index, statuses[ index % statuses.length ] )
		);
	}
	if ( value === 'mixed' ) {
		tagged = statuses.map( ( status, index ) => commissionSite( index, status ) );
	}
	update( { migrations: value, tagged } );
}
export function jumpToWizardStep( target: WizardJump ) {
	// A flow shortcut always enters the sample scenario, including from live data.
	if ( snapshot.sites === 'live' || snapshot.sites === 'loading' ) {
		setPreviewPreset( 'sites', '0' );
	}
	update( { wizardJump: { ...target } } );
}
export function consumeWizardJump() {
	update( { wizardJump: null } );
}
export function setWizardPosition( position: WizardJump | null ) {
	if ( JSON.stringify( snapshot.wizardPosition ) !== JSON.stringify( position ) ) {
		update( { wizardPosition: position } );
	}
}
let restored = false;
export function addPreviewSites( sites: AgencySite[], replaceExisting = false ) {
	if ( snapshot.sites === 'live' ) {
		return;
	}
	const siteRows = [ ...snapshot.siteRows ];
	for ( const site of sites ) {
		const existingIndex = siteRows.findIndex( ( existing ) => existing.url === site.url );
		if ( existingIndex < 0 ) {
			siteRows.push( site );
		} else if ( replaceExisting ) {
			siteRows[ existingIndex ] = site;
		}
	}
	update( { siteRows } );
}
export function useDesignPreview() {
	const state = useSyncExternalStore( subscribe, getSnapshot, getSnapshot );
	return {
		...state,
		sitesActive: enabled && state.sites !== 'live',
		migrationsActive: enabled && state.migrations !== 'live',
		plugMotionReplay: enabled ? state.plugMotionReplay : 0,
		portfolioIllustration: enabled ? state.portfolioIllustration : ( 'connected' as const ),
		siteAccessIllustration: enabled ? state.siteAccessIllustration : ( 'menu' as const ),
	};
}
export function simulateMigration( action: 'tag' | 'untag' | 'review', ids: number[] ) {
	if ( ! enabled ) {
		return false;
	}
	if ( snapshot.migrations === 'live' ) {
		return ids.some( ( id ) => id < 0 );
	}
	if ( action === 'tag' ) {
		const additions = sampleSites.flatMap( ( site, index ) =>
			ids.includes( site.a4a_site_id! ) &&
			! snapshot.tagged.some( ( tagged ) => tagged.id === site.a4a_site_id )
				? [ commissionSite( index, 'pending' ) ]
				: []
		);
		update( { tagged: [ ...snapshot.tagged, ...additions ] } );
	} else {
		update( {
			tagged: snapshot.tagged.flatMap( ( site ) => {
				if ( ! ids.includes( site.id ) ) {
					return [ site ];
				}
				if ( action === 'untag' ) {
					return [];
				}
				return [ { ...site, incentive_status: 'reverification' } ];
			} ),
		} );
	}
	return true;
}
export default function DesignPreviewControls( { surface }: { surface: 'sites' | 'migrations' } ) {
	const state = useDesignPreview();
	const [ settings, setSettings, ready ] = usePreviewPanelSettings( enabled );
	useEffect( () => {
		if ( ! enabled || restored ) {
			return;
		}
		restored = true;
		try {
			const saved = JSON.parse( localStorage.getItem( PRESET_STORAGE_KEY ) ?? '{}' );
			setPreviewPreset( 'sites', saved.sites );
			setPreviewPreset( 'migrations', saved.migrations );
			update( {
				canTag: saved.canTag !== false,
				portfolioIllustration: isPortfolioIllustrationVariant( saved.portfolioIllustration )
					? saved.portfolioIllustration
					: 'connected',
				siteAccessIllustration: isSiteAccessIllustrationVariant( saved.siteAccessIllustration )
					? saved.siteAccessIllustration
					: 'menu',
				candidates: [ '0', '1', '2', '24' ].includes( saved.candidates ) ? saved.candidates : '2',
			} );
		} catch {
			/* Storage may be unavailable. */
		}
	}, [] );
	useEffect( () => {
		if ( ! enabled || ! restored ) {
			return;
		}
		try {
			localStorage.setItem(
				PRESET_STORAGE_KEY,
				JSON.stringify( {
					sites: state.sites,
					migrations: state.migrations,
					canTag: state.canTag,
					candidates: state.candidates,
					portfolioIllustration: state.portfolioIllustration,
					siteAccessIllustration: state.siteAccessIllustration,
				} )
			);
		} catch {
			/* Storage may be unavailable. */
		}
	}, [
		state.sites,
		state.migrations,
		state.canTag,
		state.candidates,
		state.portfolioIllustration,
		state.siteAccessIllustration,
	] );
	if ( ! enabled || ! ready ) {
		return null;
	}
	const options = PRESETS[ surface ];
	const portfolioDirection =
		PORTFOLIO_DIRECTIONS.find( ( direction ) =>
			direction.variants.some( ( variant ) => variant.value === state.portfolioIllustration )
		) ?? PORTFOLIO_DIRECTIONS[ 0 ];
	const labels: Record< string, string > = {
		live: 'Live account',
		'0': 'No sites',
		'1': 'One site',
		'2': 'Two sites',
		'24': 'Dozens of sites',
		empty: 'No migrations',
		one: 'One migration',
		two: 'Two migrations',
		many: 'Dozens',
		mixed: 'All statuses',
		loading: 'Loading',
	};
	return (
		<FloatingPreviewPanel
			title={ surface === 'sites' ? 'Sites preview' : 'Migrations preview' }
			settings={ settings }
			onChange={ setSettings }
			onRestart={ () => setPreviewPreset( surface, state[ surface ] ) }
		>
			<label className="agency-design-preview-panel__state">
				<span>
					State <strong>{ labels[ state[ surface ] ] }</strong>
				</span>
				<input
					type="range"
					min={ 0 }
					max={ options.length - 1 }
					step={ 1 }
					value={ options.indexOf( state[ surface ] ) }
					aria-label="Starting state"
					aria-valuetext={ labels[ state[ surface ] ] }
					onChange={ ( event ) =>
						setPreviewPreset( surface, options[ Number( event.target.value ) ] )
					}
				/>
			</label>
			{ surface === 'sites' && (
				<>
					<SelectControl
						label="Portfolio illustration"
						value={ portfolioDirection.value }
						options={ PORTFOLIO_DIRECTIONS.map( ( { value, label } ) => ( { value, label } ) ) }
						onChange={ ( value ) => {
							const direction = PORTFOLIO_DIRECTIONS.find( ( option ) => option.value === value );
							if ( direction ) {
								update( { portfolioIllustration: direction.variants[ 0 ].value } );
							}
						} }
					/>
					<fieldset className="agency-design-preview-panel__illustration-options">
						<legend>{ portfolioDirection.label }</legend>
						{ portfolioDirection.variants.map( ( { value, label } ) => (
							<label key={ value }>
								<input
									type="radio"
									name="portfolio-illustration"
									value={ value }
									checked={ state.portfolioIllustration === value }
									onChange={ () => update( { portfolioIllustration: value } ) }
								/>
								<span>{ label }</span>
							</label>
						) ) }
					</fieldset>
					<SelectControl
						label="Site access illustration"
						value={ state.siteAccessIllustration }
						options={ SITE_ACCESS_VARIANTS.map( ( { value, label } ) => ( { value, label } ) ) }
						onChange={ ( value ) => {
							if ( isSiteAccessIllustrationVariant( value ) ) {
								update( { siteAccessIllustration: value } );
							}
						} }
					/>
					<button
						type="button"
						className="dashboard-amplify-dev-controls__reset"
						onClick={ () =>
							jumpToWizardStep(
								state.wizardPosition?.journey === 'migrate'
									? { journey: 'migrate', step: 'source' }
									: { journey: 'connect', step: 'url' }
							)
						}
					>
						{ __( 'Fill with 30 sample sites' ) }
					</button>
					<FlowMap current={ state.wizardPosition } onJump={ jumpToWizardStep } />
				</>
			) }

			{ state.migrationsActive && surface === 'migrations' && (
				<details
					open={ settings.advanced }
					onToggle={ ( event ) => {
						const advanced = event.currentTarget.open;
						if ( advanced !== settings.advanced ) {
							setSettings( ( previous ) => ( { ...previous, advanced } ) );
						}
					} }
				>
					<summary>Advanced</summary>
					<ToggleControl
						label="Allow tagging"
						checked={ state.canTag }
						onChange={ ( canTag ) => update( { canTag } ) }
					/>
					<SelectControl
						label="Connected sites in tagging picker"
						value={ state.candidates }
						options={ [ '0', '1', '2', '24' ].map( ( value ) => ( { value, label: value } ) ) }
						onChange={ ( candidates ) => update( { candidates } ) }
					/>
				</details>
			) }
			{ surface === 'sites' && (
				<details>
					<summary>Illustrations</summary>
					<button
						type="button"
						className="dashboard-amplify-dev-controls__reset"
						onClick={ () => update( { plugMotionReplay: state.plugMotionReplay + 1 } ) }
					>
						{ __( 'Replay plug animation' ) }
					</button>
				</details>
			) }
		</FloatingPreviewPanel>
	);
}

import { SelectControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useSyncExternalStore } from 'react';
import FloatingPreviewPanel, { usePreviewPanelSettings } from './floating-panel';
import FlowMap from './flow-map';
import './style.scss';
import type { WizardJump } from '../sites/site-wizard/use-site-wizard';
import type {
	AgencyPartnerManager,
	AgencySite,
	MigrationCommissionSite,
} from '@automattic/api-core';

const enabled = process.env.NODE_ENV === 'development';
const listeners = new Set< () => void >();
const subscribe = ( listener: () => void ) => {
	listeners.add( listener );
	return () => {
		listeners.delete( listener );
	};
};
export type EntryVariant = 'cards' | 'button' | 'address';
const ENTRY_VARIANTS: { value: EntryVariant; label: string }[] = [
	{ value: 'cards', label: 'A. Three cards' },
	{ value: 'button', label: 'B. One button, then the cards' },
	{ value: 'address', label: 'C. One address field' },
];
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
	wizardJump: null as WizardJump | null,
	wizardPosition: null as WizardJump | null,
	entry: 'cards' as EntryVariant,
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
export function setEntryVariant( entry: EntryVariant ) {
	update( { entry } );
	jumpToWizardStep( { journey: 'connect', step: 'start' } );
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
// The A4A partner managers, so agencies without an assigned manager still see a real person.
const gravatar = ( hash: string ) => `https://gravatar.com/avatar/${ hash }?s=240&d=mp`;
const sampleManagers: AgencyPartnerManager[] = [
	{
		name: 'Shane Tabrizi',
		avatar_url: gravatar( '6d403d067c9f019d7bbe3521f41d01c6f4f8e91289ccb30203950e0b2e7e5be7' ),
	},
	{
		name: 'Kyle Runner',
		avatar_url: gravatar( 'd4fe637a3e04b1c4068da20438eb05416fdc9c60ae8df6f2f8ac1e41fd110c90' ),
	},
	{
		name: 'Ross Spadaro',
		avatar_url: gravatar( '97ebb08281ac2e3452389d9e377a9a5908451ebbfccf555c96d1d1fd2d52a357' ),
	},
	{
		name: 'Andrew Merino',
		avatar_url: gravatar( 'b57b3147fcfb21c3bd96f90f69d268c44ef58dee177b31ab2ea1e84a6538ec85' ),
	},
];
const samplePartnerManager = sampleManagers[ Math.floor( Math.random() * sampleManagers.length ) ];
export function useDesignPreview() {
	const state = useSyncExternalStore( subscribe, getSnapshot, getSnapshot );
	return {
		...state,
		sitesActive: enabled && state.sites !== 'live',
		migrationsActive: enabled && state.migrations !== 'live',
		samplePartnerManager: enabled ? samplePartnerManager : null,
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
				entry: ENTRY_VARIANTS.some( ( variant ) => variant.value === saved.entry )
					? saved.entry
					: 'cards',
				canTag: saved.canTag !== false,
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
					entry: state.entry,
				} )
			);
		} catch {
			/* Storage may be unavailable. */
		}
	}, [ state.sites, state.migrations, state.canTag, state.candidates, state.entry ] );
	if ( ! enabled || ! ready ) {
		return null;
	}
	const options = PRESETS[ surface ];
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
					<SelectControl
						label="First-site entry"
						value={ state.entry }
						options={ ENTRY_VARIANTS }
						onChange={ ( entry ) => setEntryVariant( entry as EntryVariant ) }
					/>
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
		</FloatingPreviewPanel>
	);
}

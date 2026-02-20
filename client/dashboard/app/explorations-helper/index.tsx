/**
 * Global Explorations Helper — persists across all dashboard pages.
 *
 * Injects an "Explorations" menu into the environment badge (bottom-right DEV bar).
 * Variation state is stored in localStorage so the MCP explore page can read it.
 */
import { useState, useRef, useEffect, useCallback } from 'react';

const VARIATIONS = [
	{ key: 'A', label: 'Option 1 — Baseline' },
	{ key: 'B', label: 'Option 2 — Hub' },
	{ key: 'C', label: 'Option 3 — Flat' },
	{ key: 'D', label: 'Option 4 — Action' },
	{ key: 'E', label: 'Option 5' },
	{ key: 'F', label: 'Option 6' },
] as const;

type VariationKey = ( typeof VARIATIONS )[ number ][ 'key' ];

export const EXPLORATIONS_STORAGE_KEY = 'mcp-explore-variation';

function ExplorationsMenuContent( {
	current,
	onChange,
}: {
	current: VariationKey;
	onChange: ( v: VariationKey ) => void;
} ) {
	return (
		<>
			<div>Explorations</div>
			<div className="explorations-helper__menu">
				{ VARIATIONS.map( ( v ) => {
					const isActive = v.key === current;
					return (
						<div
							key={ v.key }
							className={ `explorations-helper__item${ isActive ? ' is-active' : '' }` }
							onClick={ () => onChange( v.key ) }
							onKeyDown={ ( e ) => {
								if ( e.key === 'Enter' ) {
									onChange( v.key );
								}
							} }
							role="button"
							tabIndex={ 0 }
						>
							{ v.label }
							{ isActive ? ' •' : '' }
						</div>
					);
				} ) }
			</div>
		</>
	);
}

function useExplorationsHelper( current: VariationKey, onChange: ( v: VariationKey ) => void ) {
	const rootRef = useRef< ReturnType< typeof import('react-dom/client').createRoot > | null >(
		null
	);

	useEffect( () => {
		let disposed = false;
		let retryTimer: ReturnType< typeof setTimeout >;

		const injectStyles = () => {
			if ( document.querySelector( '#explorations-helper-styles' ) ) {
				return;
			}
			const style = document.createElement( 'style' );
			style.id = 'explorations-helper-styles';
			style.textContent = `
				.explorations-helper__menu {
					display: none;
					background: #fff;
					box-shadow: 0 0 0 1px #dcdcde;
					padding: 8px 0;
					max-height: 80vh;
					overflow-y: auto;
					position: absolute;
					bottom: 100%;
					right: 0;
					margin: 0;
					font-size: 12px;
					min-width: 180px;
					z-index: 1001;
				}
				.environment.is-explorations:hover .explorations-helper__menu {
					display: block;
				}
				.explorations-helper__item {
					display: flex;
					justify-content: space-between;
					align-items: center;
					padding: 6px 12px;
					cursor: pointer;
					white-space: nowrap;
					text-transform: none;
					font-weight: 400;
					color: #3c434a;
					line-height: 18px;
				}
				.explorations-helper__item:hover {
					background: #f0f0f0;
				}
				.explorations-helper__item.is-active {
					font-weight: 700;
				}
			`;
			document.head.appendChild( style );
		};

		const mount = () => {
			if ( disposed ) {
				return;
			}
			const badge = document.querySelector( '.environment-badge' );
			if ( ! badge ) {
				retryTimer = setTimeout( mount, 300 );
				return;
			}

			injectStyles();

			let el = badge.querySelector( '.environment.is-explorations' ) as HTMLElement | null;
			if ( ! el ) {
				el = document.createElement( 'div' );
				el.className = 'environment is-explorations';
				el.textContent = 'Explorations';
				const devLabel = badge.querySelector( '.is-env' );
				if ( devLabel ) {
					badge.insertBefore( el, devLabel );
				} else {
					badge.appendChild( el );
				}
			}

			import( 'react-dom/client' ).then( ( { createRoot } ) => {
				if ( disposed ) {
					return;
				}
				if ( ! rootRef.current && el ) {
					rootRef.current = createRoot( el );
				}
				rootRef.current?.render(
					<ExplorationsMenuContent current={ current } onChange={ onChange } />
				);
			} );
		};

		mount();

		return () => {
			disposed = true;
			clearTimeout( retryTimer );
			if ( rootRef.current ) {
				rootRef.current.unmount();
				rootRef.current = null;
			}
			const badge = document.querySelector( '.environment-badge' );
			const el = badge?.querySelector( '.environment.is-explorations' );
			if ( el ) {
				el.remove();
			}
			const styleEl = document.querySelector( '#explorations-helper-styles' );
			if ( styleEl ) {
				styleEl.remove();
			}
		};
	}, [ current, onChange ] );

	useEffect( () => {
		const handler = ( e: KeyboardEvent ) => {
			const tag = ( e.target as HTMLElement )?.tagName;
			if ( tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' ) {
				return;
			}
			const num = parseInt( e.key, 10 );
			if ( num >= 1 && num <= VARIATIONS.length ) {
				onChange( VARIATIONS[ num - 1 ].key );
			}
		};
		document.addEventListener( 'keydown', handler );
		return () => document.removeEventListener( 'keydown', handler );
	}, [ onChange ] );
}

export default function ExplorationsHelper() {
	const [ variation, setVariation ] = useState< VariationKey >( () => {
		const stored = localStorage.getItem( EXPLORATIONS_STORAGE_KEY );
		return stored && VARIATIONS.some( ( v ) => v.key === stored )
			? ( stored as VariationKey )
			: 'A';
	} );

	const onChangeVariation = useCallback( ( v: VariationKey ) => {
		setVariation( v );
		localStorage.setItem( EXPLORATIONS_STORAGE_KEY, v );
	}, [] );

	useExplorationsHelper( variation, onChangeVariation );

	return null;
}

/* eslint-disable wpcalypso/jsx-classname-namespace */
import { useFocusTrap } from '@automattic/tour-kit';
import { __ } from '@wordpress/i18n';
import { globe, Icon, chevronUp, chevronDown } from '@wordpress/icons';
import cx from 'clsx';
import { useEffect, useState } from 'react';
import { useArrowNavigation } from './hooks';
import type { FC } from 'react';
import './style.scss';

declare const __i18n_text_domain__: string;

type ItemProps = {
	host: string;
	name: string;
	onClick: React.MouseEventHandler< HTMLButtonElement >;
	open: boolean;
	mainItem?: boolean;
	selected?: boolean;
	onKeyDown?: React.KeyboardEventHandler< HTMLButtonElement >;
	logo: SitePickerSite[ 'logo' ] | undefined;
	id: string;
	enabled?: boolean;
};

const SiteLogo: FC< { logo: ItemProps[ 'logo' ] } > = ( { logo } ) => {
	if ( logo?.url ) {
		return <img width="34" alt="" aria-hidden="true" src={ logo?.url } />;
	}
	return globe;
};

const SitePickerItem: FC< ItemProps > = ( {
	host,
	name,
	onClick,
	open,
	mainItem,
	selected,
	logo,
	id,
	enabled = true,
}: ItemProps ) => {
	return (
		<button
			className={ cx( 'site-picker__site-item', { 'main-item': mainItem, selected, enabled } ) }
			onClick={ onClick }
			// eslint-disable-next-line jsx-a11y/no-autofocus
			autoFocus={ selected }
			tabIndex={ 0 }
			id={ id }
		>
			<div className="site-picker__site-item-site-logo">
				<SiteLogo logo={ logo } />
			</div>
			<div className="site-picker__site-info">
				<h1 className="site-picker__site-title">{ name }</h1>
				<p className="site-picker__site-domain">{ host }</p>
			</div>
			{ mainItem && (
				<div>
					<Icon icon={ open ? chevronUp : chevronDown } width="34" />
				</div>
			) }
		</button>
	);
};

export type SitePickerSite = {
	ID: number | string;
	URL: string;
	name: string | undefined;
	logo: { id: string | number; sizes: never[]; url: string };
};

export type Props = {
	siteId: string | number | undefined | null;
	options: ( SitePickerSite | undefined )[];
	onPickSite: ( siteId: number | string ) => void;
	enabled: boolean;
};

export const SitePickerDropDown: FC< Props > = ( {
	siteId,
	options,
	onPickSite,
	enabled,
}: Props ) => {
	const [ ref, setRef ] = useState< HTMLDivElement | null >( null );
	const [ open, setOpen ] = useState( false );

	useFocusTrap( { current: ref } );
	useArrowNavigation( enabled, ref, open, () => setOpen( true ) );

	const selectedSite = options.find( ( s ) => s?.ID === siteId ) || options[ 0 ];

	// close on clicking outside
	useEffect( () => {
		function onClickOutside( event: MouseEvent ) {
			if ( ref && ! ref.contains( event.target as HTMLDivElement ) ) {
				setOpen( false );
			}
		}
		if ( open && enabled ) {
			window.addEventListener( 'click', onClickOutside );
			return () => {
				window.removeEventListener( 'click', onClickOutside );
			};
		}
	}, [ siteId, options, open, ref, enabled ] );

	return (
		<>
			<label className="site-picker__label" htmlFor="site-picker-button">
				{ enabled
					? __( 'Select a site', __i18n_text_domain__ )
					: __( 'Site', __i18n_text_domain__ ) }
			</label>
			<div className={ cx( 'site-picker__site-dropdown', { open } ) }>
				<SitePickerItem
					host={ selectedSite?.URL?.replace( 'https://', '' ) ?? '' }
					enabled={ enabled }
					name={
						selectedSite?.name ??
						// if site has no name, show URL
						selectedSite?.URL?.replace( 'https://', '' ) ??
						__( 'Unknown site', __i18n_text_domain__ )
					}
					logo={ selectedSite?.logo }
					// mainItem implies showing the dropdown arrow, hide it when the picking feature is disabled
					mainItem={ enabled }
					open={ open }
					onClick={ () => {
						if ( enabled ) {
							setOpen( ( o ) => ! o );
						}
					} }
					onKeyDown={ ( event ) => {
						if ( event.key === 'ArrowDown' && enabled ) {
							setOpen( true );
						}
					} }
					id="site-picker-button"
				/>
				{ open && (
					<div ref={ ( r ) => r !== ref && setRef( r ) } className="site-picker__site-drawer">
						{ options.map( ( option, index ) => (
							<SitePickerItem
								host={ option?.URL?.replace( 'https://', '' ) ?? '' }
								name={ option?.name ?? '' }
								open={ open }
								logo={ option?.logo }
								onClick={ () => {
									if ( option ) {
										onPickSite( option?.ID );
										setOpen( false );
									}
								} }
								selected={ option?.ID === siteId }
								id={ `site-picker-button-item-${ index }` }
								key={ index }
							/>
						) ) }
					</div>
				) }
			</div>
		</>
	);
};

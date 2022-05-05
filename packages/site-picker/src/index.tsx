/* eslint-disable wpcalypso/jsx-classname-namespace */
import { useFocusTrap } from '@automattic/tour-kit';
import { __ } from '@wordpress/i18n';
import { globe, Icon, chevronUp, chevronDown } from '@wordpress/icons';
import cx from 'classnames';
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
	logo: { id: string; sizes: []; url: string };
	id: string;
};

const SiteLogo: FC< { logo: ItemProps[ 'logo' ] } > = ( { logo } ) => {
	const siteLogo = <img width="34" alt="" area-hidden="true" src={ logo?.url }></img>;
	const globeLogo = globe;

	return logo?.url ? siteLogo : globeLogo;
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
}: ItemProps ) => {
	return (
		<button
			className={ cx( 'site-picker__site-item', { 'main-item': mainItem, selected } ) }
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

type Site = {
	ID: number;
	URL: string;
	name: string;
	logo: { id: string; sizes: []; url: string };
};

export type Props = {
	selectedSiteId: number | undefined;
	options: Site[];
	onPickSite: ( siteId: number ) => void;
};

export const SitePickerDropDown: FC< Props > = ( {
	selectedSiteId,
	options,
	onPickSite,
}: Props ) => {
	const [ ref, setRef ] = useState< HTMLDivElement | null >( null );
	const [ open, setOpen ] = useState( false );

	useFocusTrap( { current: ref } );
	useArrowNavigation( ref, open, () => setOpen( true ) );

	const selectedSite = options.find( ( s ) => s?.ID === selectedSiteId ) || options[ 0 ];

	// close on clicking outside
	useEffect( () => {
		function onClickOutside( event: MouseEvent ) {
			if ( ref && ! ref.contains( event.target as HTMLDivElement ) ) {
				setOpen( false );
			}
		}
		if ( open ) {
			window.addEventListener( 'click', onClickOutside );
			return () => {
				window.removeEventListener( 'click', onClickOutside );
			};
		}
	}, [ selectedSiteId, options, open, ref ] );

	return (
		<>
			<label className="site-picker__label" htmlFor="site-picker-button">
				{ __( 'Select a site', __i18n_text_domain__ ) }
			</label>
			<div className={ cx( 'site-picker__site-dropdown', { open } ) }>
				<SitePickerItem
					host={ selectedSite?.URL?.replace( 'https://', '' ) }
					name={ selectedSite?.name }
					logo={ selectedSite?.logo }
					mainItem
					open={ open }
					onClick={ () => setOpen( ( o ) => ! o ) }
					onKeyDown={ ( event ) => event.key === 'ArrowDown' && setOpen( true ) }
					id="site-picker-button"
				/>
				{ open && (
					<div ref={ ( r ) => r !== ref && setRef( r ) } className="site-picker__site-drawer">
						{ options.map( ( option, index ) => (
							<SitePickerItem
								host={ option?.URL?.replace( 'https://', '' ) }
								name={ option?.name }
								open={ open }
								logo={ option?.logo }
								onClick={ () => {
									onPickSite( option.ID );
									setOpen( false );
								} }
								selected={ option?.ID === selectedSiteId }
								id={ `site-picker-button-item-${ index }` }
							/>
						) ) }
					</div>
				) }
			</div>
		</>
	);
};

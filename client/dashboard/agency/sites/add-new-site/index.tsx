import {
	activeAgencyQuery,
	agencyDevLicensesQuery,
	agencyPendingSitesQuery,
} from '@automattic/api-queries';
import { JetpackLogo } from '@automattic/components/src/logos/jetpack-logo';
import { WordPressLogo } from '@automattic/components/src/logos/wordpress-logo';
import { useQuery } from '@tanstack/react-query';
import { useLinkProps } from '@tanstack/react-router';
import { __experimentalHeading as Heading } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { external, Icon } from '@wordpress/icons';
import { useState } from 'react';
import pressableIcon from 'calypso/assets/images/pressable/pressable-icon.svg';
import { useAnalytics } from '../../../app/analytics';
import { TextBlur } from '../../../components/text-blur';
import { ApprovalGate, useIsApprovalGated } from '../../approval-gate';
import { crossoverLinkProps } from '../../crossover/store';
import { getMarketplaceHostingSectionRoute } from '../../marketplace/paths';
import A4ALogo from './a4a-logo';
import { getAvailablePendingSites, getPressableOwnershipType, isAgencyApproved } from './lib';
import SiteTypeIcon, { DevSiteMark, type SiteTypeTone } from './site-type-icon';
import type { AddNewSiteAction, AddNewSiteProps } from './types';
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react';

import './style.scss';

const FREE_DEV_SITE_ALLOWANCE = 5;

/**
 * `useLinkProps` describes a bare anchor: it widens `children` past what a row
 * takes, and makes `href` optional because it drops it for a disabled link.
 * These links are never disabled, so a missing href is a bug.
 */
function toLinkProps( { children, href, onClick, ...rest }: ReturnType< typeof useLinkProps > ) {
	if ( ! href ) {
		throw new Error( 'Router link resolved without an href' );
	}
	// The router types its handler for anchors; the tile takes one for any element.
	return { ...rest, href, onClick: onClick as ( event: MouseEvent< HTMLElement > ) => void };
}

type OptionProps = {
	icon: ReactNode;
	title: string;
	description: string;
	/** A short count or status in the tile's corner, such as how many are left. */
	meta?: ReactNode;
	/** Leaves the dashboard in a new tab rather than opening the next step. */
	isExternal?: boolean;
	isDisabled?: boolean;
	/** Badges the icon with a plus, to tell creating a WordPress.com site from connecting one. */
	isNew?: boolean;
	/** Tints the icon well with the brand behind the option. */
	tone: SiteTypeTone;
	as?: 'a';
	onClick?: ( event: MouseEvent< HTMLElement > ) => void;
} & Omit< AnchorHTMLAttributes< HTMLAnchorElement >, 'children' | 'title' | 'onClick' >;

function Option( {
	icon,
	title,
	description,
	meta,
	isExternal,
	isDisabled,
	isNew,
	tone,
	as,
	onClick,
	...linkProps
}: OptionProps ) {
	const body = (
		<>
			<span className="agency-add-site-menu__tile-top">
				<SiteTypeIcon tone={ tone } isNew={ isNew }>
					{ icon }
				</SiteTypeIcon>
				{ meta }
				{ isExternal && (
					<Icon className="agency-add-site-menu__external" icon={ external } size={ 18 } />
				) }
			</span>
			<span className="agency-add-site-menu__title">{ title }</span>
			<span className="agency-add-site-menu__description">{ description }</span>
		</>
	);
	if ( as === 'a' ) {
		return (
			<a
				{ ...linkProps }
				href={ linkProps.href }
				className="agency-add-site-menu__tile"
				onClick={ onClick }
			>
				{ body }
			</a>
		);
	}
	return (
		<button
			type="button"
			className="agency-add-site-menu__tile"
			aria-label={ linkProps[ 'aria-label' ] }
			aria-disabled={ isDisabled || undefined }
			onClick={ isDisabled ? undefined : onClick }
		>
			{ body }
		</button>
	);
}

function Group( { title, children }: { title: string; children: ReactNode } ) {
	return (
		<section className="agency-add-site-menu__group">
			<Heading level={ 3 } size={ 15 } weight={ 500 }>
				{ title }
			</Heading>
			<div className="agency-add-site-menu__tiles">{ children }</div>
		</section>
	);
}

/**
 * Every way to add a site: connect one that exists, or create one. Each option
 * is one line of what it does, so the choice reads as a list, not a brochure.
 */
function AddNewSite( { onSelectAction, preview }: AddNewSiteProps ) {
	const { recordTracksEvent } = useAnalytics();
	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id ?? 0;
	const { data: pendingSites } = useQuery( {
		...agencyPendingSitesQuery( agencyId ),
		enabled: !! agencyId,
	} );
	const { data: devLicenses } = useQuery( {
		...agencyDevLicensesQuery( agencyId ),
		enabled: !! agencyId,
	} );
	const isGated = useIsApprovalGated();
	const [ isGateOpen, setIsGateOpen ] = useState( false );

	const availablePendingSites = getAvailablePendingSites( preview ? [] : pendingSites );
	const hasPendingSites = availablePendingSites.length > 0;
	const pressableOwnership = getPressableOwnershipType( agency );
	const ownsPressableDirectly = ! preview && pressableOwnership === 'regular';
	const availableDevSites = preview?.availableDevSites ?? devLicenses?.available;
	const canCreateDevSite =
		isGated || ( !! availableDevSites && ( !! preview || isAgencyApproved( agency ) ) );

	const recordNavigation = ( action: string ) => {
		recordTracksEvent( 'calypso_a4a_sites_new_site_action_click_item', { action } );
	};

	// Both entries below change destination once the agency loads. Keeping one
	// row and swapping only its props avoids remounting the element, which
	// Google Translate breaks.
	const pressableMarketplaceProps = useLinkProps( {
		to: getMarketplaceHostingSectionRoute( 'pressable' ),
		onClick: () => recordNavigation( 'pressable' ),
	} );
	const wpcomMarketplaceProps = useLinkProps( {
		to: getMarketplaceHostingSectionRoute( 'wpcom' ),
		onClick: () => recordNavigation( 'wpcom' ),
	} );
	// Licenses already paid for are set up from Purchases, filtered down to the
	// ones with no site yet.
	const wpcomPendingLicensesProps = useLinkProps( {
		to: '/purchases',
		search: { status: 'unassigned', search: 'WordPress.com' },
		onClick: () => recordNavigation( 'wpcom' ),
	} );

	const selectAction = ( action: AddNewSiteAction ) => {
		recordNavigation( action );
		onSelectAction( action );
	};

	return (
		<div className="agency-add-site-menu">
			{ isGateOpen && <ApprovalGate kind="dev-site" onClose={ () => setIsGateOpen( false ) } /> }
			<Group title={ __( 'Connect an existing site' ) }>
				<Option
					tone="wpcom"
					icon={ <WordPressLogo size={ 28 } /> }
					title={ __( 'WordPress.com sites' ) }
					description={ __( 'Pick from sites already on your account.' ) }
					onClick={ () => selectAction( 'import-from-wpcom' ) }
				/>
				<Option
					tone="a4a"
					icon={ <A4ALogo size={ 28 } /> }
					title={ __( 'A4A plugin' ) }
					description={ __( 'Connects the site, nothing else.' ) }
					onClick={ () => selectAction( 'a4a-connection' ) }
				/>
				<Option
					tone="jetpack"
					icon={ <JetpackLogo size={ 28 } /> }
					title={ __( 'Jetpack plugin' ) }
					description={ __( 'Connects the site, plus security and backups.' ) }
					onClick={ () => selectAction( 'jetpack-connection' ) }
				/>
			</Group>
			<Group title={ __( 'Create a new site' ) }>
				<Option
					tone="dev"
					icon={ <DevSiteMark /> }
					title={ __( 'Development site' ) }
					description={ __( 'Free on WordPress.com until you launch.' ) }
					isDisabled={ ! canCreateDevSite }
					meta={
						<span className="agency-add-site-menu__meta">
							<TextBlur isBlurred={ availableDevSites === undefined } length={ 9 }>
								{ sprintf(
									/* translators: %1$d is the number of free development sites left, %2$d the total allowance. */
									__( '%1$d of %2$d left' ),
									availableDevSites ?? 0,
									FREE_DEV_SITE_ALLOWANCE
								) }
							</TextBlur>
						</span>
					}
					onClick={ () =>
						isGated ? setIsGateOpen( true ) : selectAction( 'dev-site-configurations' )
					}
				/>
				<Option
					as="a"
					isNew
					tone="wpcom"
					icon={ <WordPressLogo size={ 28 } /> }
					title="WordPress.com"
					description={ __( 'A hosting plan for each site.' ) }
					aria-label={ __( 'Add a new production site on WordPress.com' ) }
					meta={
						// Stays mounted with nothing waiting: inserting a sibling once the
						// count arrives is what crashes translated pages.
						<span className="agency-add-site-menu__meta" hidden={ ! hasPendingSites }>
							{ hasPendingSites
								? sprintf(
										/* translators: %d is the number of paid-for sites waiting to be set up. */
										_n( '%d ready', '%d ready', availablePendingSites.length ),
										availablePendingSites.length
									)
								: '' }
						</span>
					}
					{ ...toLinkProps( hasPendingSites ? wpcomPendingLicensesProps : wpcomMarketplaceProps ) }
				/>
				<Option
					as="a"
					tone="pressable"
					icon={ <img src={ pressableIcon } alt="" width={ 26 } height={ 26 } /> }
					title="Pressable"
					description={ __( 'One hosting plan for all your sites.' ) }
					aria-label={ __( 'Add a new production site on Pressable' ) }
					isExternal={ ownsPressableDirectly }
					{ ...( ownsPressableDirectly
						? {
								...crossoverLinkProps( 'pressable', () => recordNavigation( 'pressable' ) ),
								target: '_blank',
							}
						: toLinkProps( pressableMarketplaceProps ) ) }
				/>
			</Group>
		</div>
	);
}

export default AddNewSite;

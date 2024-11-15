import { Gridicon, WordPressLogo, Popover } from '@automattic/components';
import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useRef, useState } from 'react';
import { CONTACT_URL_FOR_MIGRATION_OFFER_HASH_FRAGMENT } from 'calypso/a8c-for-agencies/components/a4a-contact-support-widget';
import A4ALogo from 'calypso/a8c-for-agencies/components/a4a-logo';
import PopoverMenuItem from 'calypso/a8c-for-agencies/components/a4a-popover/menu-item';
import {
	A4A_MIGRATIONS_MIGRATE_TO_WPCOM_LINK,
	A4A_MIGRATIONS_MIGRATE_TO_PRESSABLE_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import pressableIcon from 'calypso/assets/images/pressable/pressable-icon.svg';
import preventWidows from 'calypso/lib/post-normalizer/rule-prevent-widows';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

const MigrateSiteButton = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const popoverMenuContext = useRef( null );

	const [ isMenuVisible, setMenuVisible ] = useState( false );

	const toggleMenu = () => {
		setMenuVisible( ( isVisible ) => ! isVisible );
	};

	const popoverContent = useMemo( () => {
		return (
			<div className="migrations-overview-v2__popover-content">
				<div className="migrations-overview-v2__popover-column">
					<div className="migrations-overview-v2__popover-column-heading">
						{ translate( 'Pick an option to get started' ).toUpperCase() }
					</div>
					<PopoverMenuItem
						icon={ <A4ALogo /> }
						heading={ translate( 'Concierge service' ) }
						description={ preventWidows(
							translate(
								'Reach out and let our WordPress experts migrate your sites for you, free of charge.'
							)
						) }
						buttonProps={ {
							href: CONTACT_URL_FOR_MIGRATION_OFFER_HASH_FRAGMENT,
							onClick: () => {
								dispatch(
									recordTracksEvent( 'calypso_a4a_migrations_migrate_sites_concierge_button_click' )
								);
								setMenuVisible( false );
							},
						} }
					/>
					<PopoverMenuItem
						icon={ <WordPressLogo /> }
						heading={ translate( 'Self migrate to WordPress.com' ) }
						description={ preventWidows(
							translate(
								'Get started manually moving your sites to WordPress.com then tag them for commission.'
							)
						) }
						buttonProps={ {
							href: A4A_MIGRATIONS_MIGRATE_TO_WPCOM_LINK,
							onClick: () => {
								dispatch(
									recordTracksEvent(
										'calypso_a4a_migrations_migrate_sites_self_migrate_to_wpcom_button_click'
									)
								);
								setMenuVisible( false );
							},
						} }
					/>
					<PopoverMenuItem
						icon={ <img src={ pressableIcon } alt="" /> }
						heading={ translate( 'Self migrate to Pressable' ) }
						description={ preventWidows(
							translate(
								'Get started manually moving your sites to Pressable then tag them for commission.'
							)
						) }
						buttonProps={ {
							href: A4A_MIGRATIONS_MIGRATE_TO_PRESSABLE_LINK,
							onClick: () => {
								dispatch(
									recordTracksEvent(
										'calypso_a4a_migrations_migrate_sites_self_migrate_to_pressable_button_click'
									)
								);
								setMenuVisible( false );
							},
						} }
					/>
				</div>
			</div>
		);
	}, [ dispatch, translate ] );

	return (
		<>
			<Button
				variant="primary"
				className="migrations-overview-v2__button"
				ref={ popoverMenuContext }
				onClick={ toggleMenu }
			>
				{ translate( 'Migrate your sites' ) }
				<Gridicon className={ clsx( { reverse: isMenuVisible } ) } icon="chevron-down" />
			</Button>
			<Popover
				noArrow={ false }
				className="migrations-overview-v2__popover"
				context={ popoverMenuContext?.current }
				isVisible={ isMenuVisible }
				closeOnEsc
				onClose={ toggleMenu }
				autoPosition={ false }
				position="bottom left"
			>
				{ popoverContent }
			</Popover>
		</>
	);
};

export default MigrateSiteButton;

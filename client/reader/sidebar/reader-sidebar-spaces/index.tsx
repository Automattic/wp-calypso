import page from '@automattic/calypso-router';
import { Icon, category } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import ExpandableSidebarMenu from 'calypso/layout/sidebar/expandable';
import { SocialAddAccountMenuItem } from 'calypso/reader/sidebar/social';
import { SPACES, SPACES_BASE_PATH } from 'calypso/reader/spaces/spaces-data';
import { useDispatch } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { SpaceMenuItem } from './space-menu-item';

import './style.scss';

interface Props {
	path: string;
}

function getActiveSpaceSlug( path: string ): string | null {
	const match = path.match( /^\/reader\/spaces\/([^/?]+)/ );
	return match ? decodeURIComponent( match[ 1 ] ) : null;
}

function ReaderSidebarSpaces( { path }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const activeSlug = getActiveSpaceSlug( path );
	const isOnSpaces = path === SPACES_BASE_PATH || path.startsWith( `${ SPACES_BASE_PATH }/` );

	const [ isOpen, setIsOpen ] = useState( () => isOnSpaces );

	useEffect( () => {
		if ( isOnSpaces ) {
			setIsOpen( true );
		}
	}, [ isOnSpaces ] );

	const recordSpaceClick = ( slug: string ) => {
		dispatch( recordReaderTracksEvent( 'calypso_reader_sidebar_space_clicked', { space: slug } ) );
	};

	const recordAddSpaceClick = () => {
		dispatch( recordReaderTracksEvent( 'calypso_reader_sidebar_spaces_add_clicked' ) );
	};

	const handleMainClick = () => {
		dispatch( recordReaderTracksEvent( 'calypso_reader_sidebar_spaces_clicked' ) );
		if ( ! isOpen ) {
			setIsOpen( true );
		}
		// When the user isn't already viewing a specific space, clicking the
		// header takes them to the Spaces landing route; otherwise it just
		// opens the menu without yanking them off the page they're on.
		if ( activeSlug === null && path !== SPACES_BASE_PATH ) {
			page( SPACES_BASE_PATH );
		}
	};

	return (
		<li>
			<ExpandableSidebarMenu
				expanded={ isOpen }
				title={ translate( 'Spaces' ) }
				customIcon={ <Icon className="sidebar__menu-icon" icon={ category } /> }
				onClick={ handleMainClick }
				expandableIconClick={ () => setIsOpen( ! isOpen ) }
				disableFlyout
				className={ ! isOpen && isOnSpaces ? 'sidebar__menu--selected' : undefined }
				count={ undefined }
				icon={ null }
				materialIcon={ null }
				materialIconStyle={ null }
			>
				{ SPACES.map( ( space ) => (
					<SpaceMenuItem
						key={ space.slug }
						space={ space }
						isSelected={ activeSlug === space.slug }
						onClick={ () => recordSpaceClick( space.slug ) }
					/>
				) ) }
				<SocialAddAccountMenuItem
					label={ translate( 'Add a space' ) }
					href={ SPACES_BASE_PATH }
					onClick={ recordAddSpaceClick }
				/>
			</ExpandableSidebarMenu>
		</li>
	);
}

export default ReaderSidebarSpaces;

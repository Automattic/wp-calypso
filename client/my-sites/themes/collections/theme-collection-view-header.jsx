import { Button } from '@wordpress/components';
import { chevronLeft } from '@wordpress/icons';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import page from 'page';
import NavigationHeader from 'calypso/components/navigation-header';
import { preventWidows } from 'calypso/lib/formatting';
import { THEME_COLLECTIONS } from 'calypso/my-sites/themes/collections/collection-definitions';
import './theme-collection-view-header.scss';

export default function ThemeCollectionViewHeader( { backUrl, filter, tier, isLoggedIn } ) {
	const keyParts = [ tier, filter ];
	const key = keyParts.filter( ( part ) => !! part ).join( '-' ) || 'recommended';
	const { title, fullTitle, description } = THEME_COLLECTIONS[ key ];

	const classnames = classNames( 'theme-collection-view-header', {
		'is-logged-in': isLoggedIn,
	} );

	const navigationItems = [
		{ label: 'Themes', href: backUrl },
		{ label: title, href: '' },
	];

	return (
		<div className={ classnames }>
			{ isLoggedIn ? (
				<NavigationHeader navigationItems={ navigationItems } />
			) : (
				<Button
					className="theme-collection-view-header__back"
					icon={ chevronLeft }
					onClick={ () => page( backUrl ) }
					variant="link"
				>
					{ translate( 'Back' ) }
				</Button>
			) }
			<div className="theme-collection-view-header__info">
				{ fullTitle && <h2 className="theme-collection-view-header__title">{ fullTitle }</h2> }
				{ description && (
					<div className="theme-collection-view-header__description">
						{ preventWidows( description ) }
					</div>
				) }
			</div>
		</div>
	);
}

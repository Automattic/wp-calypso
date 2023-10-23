import { Button } from '@wordpress/components';
import { chevronLeft } from '@wordpress/icons';
import { translate } from 'i18n-calypso';
import page from 'page';
import { preventWidows } from 'calypso/lib/formatting';
import { THEME_COLLECTIONS } from 'calypso/my-sites/themes/collections/collection-definitions';

export default function ThemeCollectionViewHeader( { backUrl, filter, tier } ) {
	const keyParts = [ tier, filter ];
	const key = keyParts.filter( ( part ) => !! part ).join( '-' ) || 'recommended';
	const { fullTitle, description } = THEME_COLLECTIONS[ key ];

	return (
		<div className="theme-collection-view-header">
			<Button
				className="theme-collection-view-header__back"
				icon={ chevronLeft }
				onClick={ () => page( backUrl ) }
				variant="link"
			>
				{ translate( 'Back' ) }
			</Button>
			{ fullTitle && <h2 className="theme-collection-view-header__title">{ fullTitle }</h2> }
			{ description && (
				<div className="theme-collection-view-header__description">
					{ preventWidows( description ) }
				</div>
			) }
		</div>
	);
}

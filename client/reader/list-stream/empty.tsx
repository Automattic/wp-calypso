import DOMPurify from 'dompurify';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import EmptyContent from 'calypso/components/empty-content';

export default function ListEmptyContent(): JSX.Element {
	const translate = useTranslate();
	const queryParams = new URLSearchParams( location.search );
	const lastPageLink = DOMPurify.sanitize( queryParams.get( 'last_page' ) ?? '' );

	useEffect( (): void => {
		// For clean URL remove last_page query param.
		if ( lastPageLink ) {
			const url = new URL( window.location.href );

			url.searchParams.delete( 'last_page' );
			history.replaceState( null, '', url );
		}
	}, [ lastPageLink ] );

	function lastPageIsUserProfileLists(): boolean {
		return /^\/read\/users\/[a-z0-9]+\/lists$/.test( lastPageLink );
	}

	function getActionBtnLink(): string {
		return lastPageIsUserProfileLists() ? lastPageLink : '/read';
	}

	function getActionBtnText(): string {
		return lastPageIsUserProfileLists()
			? translate( 'Back to User Profile' )
			: translate( 'Back to Following' );
	}

	const action = (
		<a className="empty-content__action button is-primary" href={ getActionBtnLink() }>
			{ getActionBtnText() }
		</a>
	);

	return (
		<EmptyContent
			title={ translate( 'No recent posts' ) }
			line={ translate( 'The sites in this list have not posted anything recently.' ) }
			action={ action }
			illustration="/calypso/images/illustrations/illustration-empty-results.svg"
			illustrationWidth={ 400 }
		/>
	);
}

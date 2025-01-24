import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import EmptyContent from 'calypso/components/empty-content';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';

export default function ListEmptyContent(): JSX.Element {
	const translate = useTranslate();
	const previousRoute: string = useSelector( getPreviousRoute );

	function previousRouteIsUserProfileLists(): boolean {
		return /^\/read\/users\/[a-z0-9]+\/lists\??$/.test( previousRoute );
	}

	function getActionBtnLink(): string {
		return previousRouteIsUserProfileLists() ? previousRoute : '/read';
	}

	function getActionBtnText(): string {
		return previousRouteIsUserProfileLists()
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

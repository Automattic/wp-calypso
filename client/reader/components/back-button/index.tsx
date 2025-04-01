import page from '@automattic/calypso-router';
import BackButton from 'calypso/components/back-button';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import type { AppState } from 'calypso/types';

export default function ReaderBackButton( {
	handleBack,
	preventRouteChange = false,
	forceShow = false,
	...props
}: {
	handleBack?: ( event?: React.MouseEvent< HTMLButtonElement > ) => void;
	preventRouteChange?: boolean;
	forceShow?: boolean;
} ): JSX.Element | null {
	const previousRoute = useSelector< AppState, string >( getPreviousRoute );
	const isLoggedIn = useSelector< AppState, boolean >( isUserLoggedIn );

	if ( ! forceShow && ( ! isLoggedIn || ! previousRoute ) ) {
		return null;
	}

	return (
		<BackButton
			{ ...props }
			onClick={ ( event?: React.MouseEvent< HTMLButtonElement > ) => {
				handleBack?.( event );
				! preventRouteChange && page.back( previousRoute );
			} }
		/>
	);
}

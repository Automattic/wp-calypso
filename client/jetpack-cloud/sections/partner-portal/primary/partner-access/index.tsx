import { Button, Spinner } from '@automattic/components';
import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import CardHeading from 'calypso/components/card-heading';
import QueryJetpackPartnerPortalPartner from 'calypso/components/data/query-jetpack-partner-portal-partner';
import Main from 'calypso/components/main';
import { useReturnUrl } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	isFetchingPartner,
	getCurrentPartner,
	hasFetchedPartner,
} from 'calypso/state/partner-portal/partner/selectors';

import './style.scss';

export default function PartnerAccess() {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const hasFetched = useSelector( hasFetchedPartner );
	const isFetching = useSelector( isFetchingPartner );
	const partner = useSelector( getCurrentPartner );
	const keys = partner?.keys || [];
	const hasPartner = hasFetched && ! isFetching && keys.length > 0;
	const showError = hasFetched && ! isFetching && keys.length === 0;

	const onManageSitesClick = () => {
		dispatch(
			recordTracksEvent( 'calypso_partner_portal_partner_access_error_manage_sites_click' )
		);
	};

	const onManageSignUpClick = () => {
		dispatch(
			recordTracksEvent( 'calypso_partner_portal_partner_access_error_manage_sign_up_click' )
		);
	};

	useReturnUrl( hasPartner );

	const manageSignUpLink = () => {
		const returnString = String( getQueryArg( window.location.href, 'return' ) );
		let signUpLink = '/manage/signup';
		if ( returnString.includes( 'source=manage-pricing-page' ) ) {
			const newString = returnString.replace( '/partner-portal/issue-license', '' );
			signUpLink = `/manage/signup${ newString }`;
		}

		return signUpLink;
	};

	return (
		<Main className="partner-access">
			<QueryJetpackPartnerPortalPartner />

			<CardHeading size={ 36 }>{ translate( 'Licensing' ) }</CardHeading>

			{ isFetching && <Spinner /> }

			{ showError && (
				<>
					<div className="partner-access__error">
						<p>{ translate( 'Your account is not registered as a partner account.' ) }</p>

						<Button href="/" onClick={ onManageSitesClick } primary>
							{ translate( 'Manage Sites' ) }
						</Button>
					</div>
					<div className="partner-access__signup">
						<p>
							{ translate( '{{link}}Learn more{{/link}} about Jetpack Manage.', {
								components: {
									link: <a href="https://jetpack.com/manage/" />,
								},
							} ) }
						</p>

						<Button href={ manageSignUpLink() } onClick={ onManageSignUpClick } primary>
							{ translate( 'Sign up for Jetpack Manage' ) }
						</Button>
					</div>
				</>
			) }
		</Main>
	);
}

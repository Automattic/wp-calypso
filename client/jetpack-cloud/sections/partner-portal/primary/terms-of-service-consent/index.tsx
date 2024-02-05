import { Button, Card, FormLabel, Gridicon, Spinner } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import CardHeading from 'calypso/components/card-heading';
import QueryJetpackPartnerPortalPartner from 'calypso/components/data/query-jetpack-partner-portal-partner';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import Main from 'calypso/components/main';
import { useReturnUrl } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import useTOSConsentMutation from 'calypso/state/partner-portal/licenses/hooks/use-tos-consent-mutation';
import { receivePartner } from 'calypso/state/partner-portal/partner/actions';
import {
	getCurrentPartner,
	hasFetchedPartner,
} from 'calypso/state/partner-portal/partner/selectors';
import { ToSConsent } from 'calypso/state/partner-portal/types';
import formatApiPartner from '../../lib/format-api-partner';
import './style.scss';

export default function TermsOfServiceConsent() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const consent = useTOSConsentMutation( {
		onSuccess: ( partner ) => {
			dispatch( receivePartner( formatApiPartner( partner ) ) );
			dispatch( recordTracksEvent( 'calypso_partner_portal_tos_agree_success' ) );
		},
		onError: () => {
			dispatch(
				errorNotice( translate( 'We were unable to update your partner account details.' ) )
			);
			dispatch( recordTracksEvent( 'calypso_partner_portal_tos_agree_error' ) );
		},
	} );
	const partner = useSelector( getCurrentPartner );
	const hasConsented = ( partner?.tos || ToSConsent.NotConsented ) !== ToSConsent.NotConsented;
	const fetchedPartner = useSelector( hasFetchedPartner );
	const [ checkedTOS, setCheckedTOS ] = useState( false );

	const checkTOS = useCallback(
		( event: React.ChangeEvent< HTMLInputElement > ) => {
			setCheckedTOS( event.target.checked );
			dispatch(
				recordTracksEvent( 'calypso_partner_portal_tos_toggle', {
					checked: event.target.checked,
				} )
			);
		},
		[ setCheckedTOS ]
	);

	const agreeToTOS = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_partner_portal_tos_agree_click' ) );
		consent.mutate();
	}, [] );

	useReturnUrl( hasConsented );

	return (
		<Main className="terms-of-service-consent">
			<QueryJetpackPartnerPortalPartner />

			<CardHeading size={ 36 }>{ translate( 'Licensing' ) }</CardHeading>

			{ ! fetchedPartner && <Spinner /> }

			{ ! hasConsented && (
				<Card>
					<CardHeading>{ translate( 'Terms of Service' ) }</CardHeading>

					<div className="terms-of-service-consent__content">
						<FormLabel>
							<FormInputCheckbox checked={ checkedTOS } onChange={ checkTOS } />
							<span>
								{ translate(
									'I understand and acknowledge that by checking this box, I have read and agree to the terms of the {{link}}%(link_text)s{{icon}}{{/icon}}{{/link}}.',
									{
										components: {
											link: (
												<a
													href="https://jetpack.com/platform-agreement/"
													target="_blank"
													rel="noopener noreferrer"
												></a>
											),
											icon: <Gridicon icon="external" size={ 18 } />,
										},
										args: { link_text: 'Jetpack Agency Platform Beta Agreement' },
									}
								) }
							</span>
						</FormLabel>
					</div>

					<div className="terms-of-service-consent__actions">
						<Button
							className="terms-of-service-consent__proceed"
							onClick={ agreeToTOS }
							disabled={ ! checkedTOS }
							busy={ consent.isPending }
							primary
						>
							{ translate( 'Proceed' ) }
						</Button>
					</div>
				</Card>
			) }
		</Main>
	);
}

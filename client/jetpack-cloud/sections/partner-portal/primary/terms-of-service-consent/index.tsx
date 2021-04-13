/**
 * External dependencies
 */
import React, { ReactElement, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	getCurrentPartner,
	hasFetchedPartner,
} from 'calypso/state/partner-portal/partner/selectors';
import { receivePartner } from 'calypso/state/partner-portal/partner/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import { formatApiPartner } from 'calypso/jetpack-cloud/sections/partner-portal/utils';
import QueryJetpackPartnerPortalPartner from 'calypso/components/data/query-jetpack-partner-portal-partner';
import Main from 'calypso/components/main';
import CardHeading from 'calypso/components/card-heading';
import Spinner from 'calypso/components/spinner';
import { useReturnUrl } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import useTOSConsentMutation from 'calypso/state/partner-portal/licenses/hooks/use-tos-consent-mutation';
import { ToSConsent } from 'calypso/state/partner-portal/types';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import FormLabel from 'calypso/components/forms/form-label';
import Gridicon from 'calypso/components/gridicon';

/**
 * Style dependencies
 */
import './style.scss';

export default function TermsOfServiceConsent(): ReactElement | null {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const consent = useTOSConsentMutation( {
		onSuccess: ( partner ) => {
			dispatch( receivePartner( formatApiPartner( partner ) ) );
		},
		onError: () => {
			dispatch(
				errorNotice( translate( 'We were unable to update your partner account details.' ) )
			);
		},
	} );
	const partner = useSelector( getCurrentPartner );
	const hasConsented = ( partner?.tos || ToSConsent.NotConsented ) !== ToSConsent.NotConsented;
	const fetchedPartner = useSelector( hasFetchedPartner );
	const [ checkedTOS, setCheckedTOS ] = useState( false );

	const checkTOS = useCallback(
		( event ) => {
			setCheckedTOS( event.target.checked );
		},
		[ setCheckedTOS ]
	);

	const agreeToTOS = useCallback( () => {
		consent.mutate();
	}, [] );

	useReturnUrl( hasConsented );

	return (
		<Main className="terms-of-service-consent">
			<QueryJetpackPartnerPortalPartner />

			<CardHeading size={ 36 }>{ translate( 'Partner Portal' ) }</CardHeading>

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
							busy={ consent.isLoading }
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

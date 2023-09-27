import { PLAN_BUSINESS, PLAN_ECOMMERCE } from '@automattic/calypso-products';
import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import CardHeading from 'calypso/components/card-heading';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import Layout from '../../layout';
import LayoutHeader from '../../layout/header';
import CardContent from './card-content';

import './style.scss';

export default function WPCOMAtomicHosting() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const title = translate( 'Create a new WordPress.com site' );
	const [ isRequesting, setIsRequesting ] = useState( false );

	const plansToBeDisplayed = [ PLAN_BUSINESS, PLAN_ECOMMERCE ];

	useEffect( () => {
		// Track page view
		dispatch(
			recordTracksEvent( 'calypso_jetpack_agency_dashboard_wpcom_atomic_hosting_page_view' )
		);
	}, [ dispatch ] );

	return (
		<Layout title={ title } wide>
			<LayoutHeader>
				<CardHeading size={ 36 }>{ title }</CardHeading>
			</LayoutHeader>

			<div className="wpcom-atomic-hosting__card-container">
				{ plansToBeDisplayed.map( ( plan ) => (
					<Card key={ plan } className="wpcom-atomic-hosting__card" compact>
						<CardContent
							planSlug={ plan }
							isRequesting={ isRequesting }
							setIsRequesting={ setIsRequesting }
						/>
					</Card>
				) ) }
			</div>
		</Layout>
	);
}

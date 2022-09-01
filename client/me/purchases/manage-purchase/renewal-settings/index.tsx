import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import HeaderCake from 'calypso/components/header-cake';
import Layout from 'calypso/components/layout';
import Column from 'calypso/components/layout/column';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import titles from 'calypso/me/purchases/titles';
import { getByPurchaseId } from 'calypso/state/purchases/selectors';
import type { Purchase } from 'calypso/lib/purchases/types';

interface Props {
	getManagePurchaseUrlFor: ( siteSlug: string, purchaseId: number ) => string;
	purchaseId: number;
	siteSlug: string;
}

export default function PurchaseRenewalSettings( {
	getManagePurchaseUrlFor,
	purchaseId,
	siteSlug,
}: Props ) {
	const purchase: Purchase | undefined = useSelector( ( state ) =>
		getByPurchaseId( state, purchaseId )
	);

	return (
		<>
			<PageViewTracker
				path="/me/purchases/:site/:purchaseId/renewal-settings"
				title="Purchase Settings"
			/>

			<HeaderCake backHref={ getManagePurchaseUrlFor( siteSlug, purchaseId ) }>
				{ titles.renewalSettings }
			</HeaderCake>

			<Layout>
				<Column type="main">
					<MainCard purchase={ purchase } />
				</Column>
				<Column type="sidebar">
					<SidebarCard purchase={ purchase } />
				</Column>
			</Layout>
		</>
	);
}

function MainCard( { purchase }: { purchase?: Purchase } ) {
	const translate = useTranslate();

	if ( ! purchase ) {
		return null;
	}

	return (
		<Card>
			<CardHeading tagName="h1" size={ 16 } isBold={ true } className="renewal-settings__title">
				{ translate( 'Automatic renewal' ) }
			</CardHeading>
			<p>
				{ translate(
					'With auto-renew enabled, you don’t have to worry about your upcoming subscription renewal.' +
						'We will take care of it.'
				) }
			</p>
			<p>
				{ translate(
					'If you disable auto-renew you may lose access to key features and your site may look broken or with a different appearence.'
				) }
			</p>
		</Card>
	);
}

function SidebarCard( { purchase }: { purchase?: Purchase } ) {
	const translate = useTranslate();

	if ( ! purchase ) {
		return null;
	}

	return (
		<Card>
			<CardHeading tagName="h1" size={ 16 } isBold={ true } className="renewal-settings__title">
				{ translate( 'Your plan key features' ) }
			</CardHeading>
		</Card>
	);
}

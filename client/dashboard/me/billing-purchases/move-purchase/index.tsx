import { purchaseQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __, _x, sprintf } from '@wordpress/i18n';
import { useCallback, useState } from 'react';
import { useAuth } from '../../../app/auth';
import Breadcrumbs from '../../../app/breadcrumbs';
import { movePurchaseRoute } from '../../../app/router/me';
import { Card, CardBody } from '../../../components/card';
import Notice from '../../../components/notice';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { SelectSite } from '../../../domains/domain-transfer/select-site';
import { getTitleForDisplay, isDotcomPlan } from '../../../utils/purchase';
import { canSiteReceivePurchase, isPurchaseMovableToAnotherSite } from './eligibility';
import { SiteTransferReview } from './site-transfer-review';
import type { Site } from '@automattic/api-core';

import './style.scss';

export default function MovePurchase() {
	const { purchaseId } = movePurchaseRoute.useParams();
	const { data: purchase } = useSuspenseQuery( purchaseQuery( parseInt( purchaseId ) ) );
	const { user } = useAuth();
	const [ targetSite, setTargetSite ] = useState< Site >();
	const siteFilter = useCallback(
		( site: Site ) => canSiteReceivePurchase( purchase, site ),
		[ purchase ]
	);

	const isOwner = String( user.ID ) === String( purchase.user_id );
	const canMove = isOwner && isPurchaseMovableToAnotherSite( purchase );
	const productTitle = getTitleForDisplay( purchase );
	const sourceName = purchase.site_slug || purchase.domain;

	const renderContent = () => {
		if ( ! canMove ) {
			return (
				<Notice variant="warning" title={ __( 'This purchase can’t be moved' ) }>
					{ __(
						'Only active WordPress.com plans and domains can be moved to another site by their owner.'
					) }
				</Notice>
			);
		}

		if ( targetSite ) {
			return (
				<SiteTransferReview
					purchase={ purchase }
					targetSite={ targetSite }
					onChangeSite={ () => setTargetSite( undefined ) }
				/>
			);
		}

		return (
			<Card>
				<CardBody>
					<SelectSite
						attachedSiteId={ purchase.blog_id }
						filter={ siteFilter }
						onSiteSelect={ setTargetSite }
					/>
				</CardBody>
			</Card>
		);
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 4 } /> }
					title={
						// translators: Moving a subscription, such as a plan or domain, to a different site.
						_x( 'Move to another site', 'subscription site transfer' )
					}
					description={
						isDotcomPlan( purchase )
							? sprintf(
									// translators: %1$s is a plan name, e.g. "Business plan"; %2$s is a site address.
									__(
										'Move %1$s from %2$s to another site you own. Only sites without a paid plan are listed.'
									),
									productTitle,
									sourceName
								)
							: sprintf(
									// translators: %1$s is a product name, e.g. "example.com Domain Registration"; %2$s is a site address.
									__( 'Move %1$s from %2$s to another site you own.' ),
									productTitle,
									sourceName
								)
					}
				/>
			}
		>
			{ renderContent() }
		</PageLayout>
	);
}

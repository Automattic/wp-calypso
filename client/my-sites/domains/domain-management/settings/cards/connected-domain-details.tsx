/* eslint-disable wpcalypso/jsx-classname-namespace */

import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { type as domainTypes } from 'calypso/lib/domains/constants';
import { domainMappingSetup } from 'calypso/my-sites/domains/paths';
import { getManagePurchaseUrlFor } from 'calypso/my-sites/purchases/paths';
import type { DetailsCardProps } from './types';

import './style.scss';

const ConnectedDomainDetails = ( {
	domain,
	isLoadingPurchase,
	selectedSite,
}: DetailsCardProps ) => {
	const moment = useLocalizedMoment();
	const translate = useTranslate();

	const renderPlanDetailsButton = () => {
		if ( ! domain.bundledPlanSubscriptionId ) {
			return null;
		}

		return (
			<Button
				href={ getManagePurchaseUrlFor( selectedSite.slug, domain.bundledPlanSubscriptionId ) }
				disabled={ isLoadingPurchase }
			>
				{ translate( 'View plan settings' ) }
			</Button>
		);
	};

	const renderMappingInstructionsButton = () => {
		const registrationDatePlus3Days = moment.utc( domain.registrationDate ).add( 3, 'days' );
		const shouldRenderMappingInstructions =
			domain.type === domainTypes.MAPPED &&
			! domain.pointsToWpcom &&
			moment.utc().isAfter( registrationDatePlus3Days );

		if ( ! shouldRenderMappingInstructions ) {
			return null;
		}

		const setupStep = domain.connectionMode === 'advanced' ? 'advanced_update' : 'suggested_update';

		return (
			<Button
				href={ domainMappingSetup( selectedSite.slug, domain.domain, setupStep ) }
				disabled={ isLoadingPurchase }
			>
				{ translate( 'View connection setup instructions' ) }
			</Button>
		);
	};

	const getDescriptionText = () => {
		const args = {
			args: {
				expirationDate: moment( domain.expiry ).format( 'LL' ),
			},
		};

		if ( domain.expired ) {
			return translate( 'Domain connection expired on %(expirationDate)s', args );
		}

		const expireWithBundledMessage = domain.isAutoRenewing
			? translate(
					'Domain connection will be auto-renewed with your plan on %(expirationDate)s',
					args
			  )
			: translate( 'Domain connection expires with your plan on %(expirationDate)s', args );

		const expireWithoutBundledMessage = domain.isAutoRenewing
			? translate( 'Domain connection will be auto-renewed on %(expirationDate)s', args )
			: translate( 'Domain connection expires on %(expirationDate)s', args );

		return domain.bundledPlanSubscriptionId
			? expireWithBundledMessage
			: expireWithoutBundledMessage;
	};

	return (
		<div className="details-card">
			<div className="details-card__section">{ getDescriptionText() }</div>
			<div className="details-card__section">
				{ renderPlanDetailsButton() }
				{ renderMappingInstructionsButton() }
			</div>
		</div>
	);
};

export default ConnectedDomainDetails;

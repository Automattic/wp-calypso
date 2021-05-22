/**
 * External dependencies
 */
import React, { ReactElement, useCallback, useRef, useState } from 'react';
import { numberFormat, useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import Tooltip from 'calypso/components/tooltip';
import Gridicon from 'calypso/components/gridicon';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import useBillingDashboardQuery from 'calypso/state/partner-portal/licenses/hooks/use-billing-dashboard-query';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';

/**
 * Style dependencies
 */
import './style.scss';

function CostTooltip(): ReactElement {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const tooltip = useRef< SVGSVGElement >( null );
	const [ isOpen, setIsOpen ] = useState( false );

	const open = useCallback( () => {
		setIsOpen( true );
		dispatch( recordTracksEvent( 'calypso_partner_portal_billing_summary_cost_tooltip_open' ) );
	}, [ dispatch, setIsOpen ] );

	const close = useCallback( () => {
		setIsOpen( false );
		dispatch( recordTracksEvent( 'calypso_partner_portal_billing_summary_cost_tooltip_close' ) );
	}, [ dispatch, setIsOpen ] );

	return (
		<>
			<Button borderless className="billing-summary__open-cost-tooltip" onClick={ open }>
				<Gridicon ref={ tooltip } icon="info-outline" size={ 24 } />
			</Button>

			<Tooltip
				className="billing-summary__cost-tooltip"
				context={ tooltip.current }
				isVisible={ isOpen }
				position="bottom"
				showOnMobile
			>
				<div>
					<p>
						{ translate(
							'The total cost is being calculated based on the current date as well as the number of licenses in total.'
						) }
					</p>

					<Button
						borderless
						compact
						className="billing-summary__close-cost-tooltip"
						onClick={ close }
					>
						<Gridicon icon="cross" size={ 18 } />
					</Button>
				</div>
			</Tooltip>
		</>
	);
}

export default function BillingSummary(): ReactElement {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const billing = useBillingDashboardQuery();

	return (
		<Card className="billing-summary">
			<div className="billing-summary__stat billing-summary__total-licenses">
				<span className="billing-summary__label">{ translate( 'Total licenses' ) }</span>
				<strong className="billing-summary__value">
					{ billing.isSuccess && numberFormat( billing.data.licenses.total, 0 ) }

					{ ! billing.isSuccess && <TextPlaceholder /> }
				</strong>
			</div>

			<div className="billing-summary__stat billing-summary__assigned-licenses">
				<span className="billing-summary__label">{ translate( 'Assigned licenses' ) }</span>
				<strong className="billing-summary__value">
					{ billing.isSuccess && numberFormat( billing.data.licenses.assigned, 0 ) }

					{ ! billing.isSuccess && <TextPlaceholder /> }
				</strong>
			</div>

			<div className="billing-summary__stat billing-summary__unassigned-licenses">
				<span className="billing-summary__label">{ translate( 'Unassigned licenses' ) }</span>
				<strong className="billing-summary__value">
					{ billing.isSuccess && numberFormat( billing.data.licenses.unassigned, 0 ) }

					{ ! billing.isSuccess && <TextPlaceholder /> }
				</strong>
			</div>

			<div className="billing-summary__stat billing-summary__cost">
				<span className="billing-summary__label">
					{ billing.isSuccess && <CostTooltip /> }
					{ billing.isSuccess &&
						translate( 'Cost for %(date)s', {
							args: { date: moment( billing.data.date ).format( 'MMMM, YYYY' ) },
						} ) }

					{ ! billing.isSuccess && <br /> }
				</span>
				<strong className="billing-summary__value">
					{ billing.isSuccess && formatCurrency( billing.data.costs.total, 'USD' ) }

					{ ! billing.isSuccess && <TextPlaceholder /> }
				</strong>
			</div>
		</Card>
	);
}

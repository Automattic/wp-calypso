import { Button, Card, Gridicon, Tooltip } from '@automattic/components';
import { formatCurrency, formatNumber } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useRef, useState } from 'react';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import useFetchBillingSummary from 'calypso/a8c-for-agencies/data/purchases/use-fetch-billing-summary';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

function CostTooltip() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const tooltip = useRef< SVGSVGElement >( null );
	const [ isOpen, setIsOpen ] = useState( false );

	const open = useCallback( () => {
		setIsOpen( true );
		dispatch( recordTracksEvent( 'calypso_a4a_billing_summary_cost_tooltip_open' ) );
	}, [ dispatch, setIsOpen ] );

	const close = useCallback( () => {
		setIsOpen( false );
		dispatch( recordTracksEvent( 'calypso_a4a_billing_summary_cost_tooltip_close' ) );
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

export default function BillingSummary() {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const billing = useFetchBillingSummary();

	return (
		<Card className="billing-summary">
			<div className="billing-summary__stat billing-summary__total-licenses">
				<span className="billing-summary__label">{ translate( 'Total licenses' ) }</span>
				<strong className="billing-summary__value">
					{ billing.isSuccess && formatNumber( billing.data.licenses.total ) }
					{ billing.isLoading && <TextPlaceholder /> }

					{ billing.isError && <Gridicon icon="minus" /> }
				</strong>
			</div>
			<div className="billing-summary__stat billing-summary__assigned-licenses">
				<span className="billing-summary__label">{ translate( 'Assigned licenses' ) }</span>
				<strong className="billing-summary__value">
					{ billing.isSuccess && formatNumber( billing.data.licenses.assigned ) }

					{ billing.isLoading && <TextPlaceholder /> }

					{ billing.isError && <Gridicon icon="minus" /> }
				</strong>
			</div>
			<div className="billing-summary__stat billing-summary__unassigned-licenses">
				<span className="billing-summary__label">{ translate( 'Unassigned licenses' ) }</span>
				<strong className="billing-summary__value">
					{ billing.isSuccess && formatNumber( billing.data.licenses.unassigned ) }

					{ billing.isLoading && <TextPlaceholder /> }

					{ billing.isError && <Gridicon icon="minus" /> }
				</strong>
			</div>
			<div className="billing-summary__stat billing-summary__cost">
				<span className="billing-summary__label">
					{ billing.isSuccess && <CostTooltip /> }
					{ billing.isSuccess &&
						/* translators: fullMonth (e.g. "January") and fullYear (e.g. "2024") */
						translate( 'Cost for %(fullMonth)s, %(fullYear)s', {
							args: {
								fullMonth: moment( billing.data.date ).format( 'MMMM' ),
								fullYear: moment( billing.data.date ).format( 'YYYY' ),
							},
						} ) }

					{ ! billing.isSuccess && <br /> }
				</span>
				<strong className="billing-summary__value">
					{ billing.isSuccess && formatCurrency( billing.data.costs.total, 'USD' ) }

					{ billing.isLoading && <TextPlaceholder /> }

					{ billing.isError && <Gridicon icon="minus" /> }
				</strong>
			</div>
		</Card>
	);
}

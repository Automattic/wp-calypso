import { TRADE_MARK_CLAIMS_MODAL_COPY } from '@automattic/domain-search';
import { Fragment } from 'react';

export const trademarkNoticeText = (
	<Fragment>
		<h3>Trademark Notice</h3>
		<p>{ TRADE_MARK_CLAIMS_MODAL_COPY.REASON }</p>
		<p>
			<strong>
				<em>{ TRADE_MARK_CLAIMS_MODAL_COPY.ENTITLEMENT }</em>
			</strong>
		</p>
		<p>{ TRADE_MARK_CLAIMS_MODAL_COPY.INSTRUCTIONS }</p>
		<p>{ TRADE_MARK_CLAIMS_MODAL_COPY.CONSENT }</p>
	</Fragment>
);

export const trademarkDecisionText = <p>{ TRADE_MARK_CLAIMS_MODAL_COPY.COURT_CASES }</p>;

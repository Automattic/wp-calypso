/**
 * External dependencies
 */
import React from 'react';
import { times, random } from 'lodash';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import FormattedHeader from 'components/formatted-header';

/* eslint-disable wpcalypso/jsx-classname-namespace */
const placeholderContent = (
	<Main className="jetpack-connect__hide-plan-icons" wideLayout>
		<div className="jetpack-connect__plans placeholder">
			<FormattedHeader
				headerText={ <span className="placeholder-text">Your site is now connected!</span> }
				subHeaderText={
					<span className="placeholder-text">Now pick a plan that's right for you.</span>
				}
			/>

			<div className="plans-wrapper">
				<div className="plan-features plan-features--signup">
					<table className="plan-features__table">
						<tbody>
							<tr className="plan-features__row">
								{ times( 3, ( cellKey ) => (
									<td className="plan-features__table-item has-border-top" key={ cellKey }>
										<div className="plan-features__header-wrapper">
											<header className="plan-features__header">
												<div className="plan-features__header-text">
													<h4 className="plan-features__header-title">
														<span className="placeholder-text">Premium</span>
													</h4>
													<span className="placeholder-text">Best for small businesses</span>
												</div>
											</header>
											<div className="plan-features__pricing">
												<span className="plan-price is-original placeholder-text">$108,00</span>
												<span className="plan-price placeholder-text">$99,00</span>
											</div>
										</div>
										<div className="plan-features__actions">
											<div className="plan-features__actions-buttons">
												<div className="placeholder-text">
													Upgrade
													<br />
													Your Plan
												</div>
											</div>
										</div>
										{ times( 5, ( featureKey ) => (
											<div className="plan-features__item" key={ featureKey }>
												<span className="placeholder-text">
													Test feature { random( 1, Number.MAX_SAFE_INTEGER ) }
												</span>
											</div>
										) ) }
									</td>
								) ) }
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</Main>
);
/* eslint-enable wpcalypso/jsx-classname-namespace */

export default function PlansPlaceholder() {
	return placeholderContent;
}

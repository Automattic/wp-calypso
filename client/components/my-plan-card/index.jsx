/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import PlanIcon from 'components/plans/plan-icon';

/**
 * Style dependencies
 */
import './style.scss';

const MyPlanCard = ( {
	buttonLabel,
	buttonTarget,
	expirationDate,
	moment,
	plan,
	tagLine,
	title,
	translate,
} ) => {
	return (
		<Card className="my-plan-card" compact>
			<div className="my-plan-card__primary">
				{ plan && (
					<div className="my-plan-card__icon">
						<PlanIcon plan={ plan } />
					</div>
				) }
				<div className="my-plan-card__header">
					{ title && <h2 className="my-plan-card__title">{ title }</h2> }
					{ tagLine && <p className="my-plan-card__tag-line">{ tagLine }</p> }
				</div>
			</div>
			<div className="my-plan-card__secondary">
				{ expirationDate && (
					<div className="my-plan-card__expiration-date">
						{ translate( 'Expires on %(expirationDate)s', {
							args: {
								expirationDate: moment( expirationDate ).format( 'MMMM D, YYYY' ),
							},
						} ) }
					</div>
				) }
				{ buttonTarget && buttonLabel && (
					<div className="my-plan-card__action">
						<Button href={ buttonTarget } compact>
							{ buttonLabel }
						</Button>
					</div>
				) }
			</div>
		</Card>
	);
};

MyPlanCard.propTypes = {
	buttonLabel: PropTypes.string,
	buttonTarget: PropTypes.string,
	expirationDate: PropTypes.string,
	plan: PropTypes.string,
	tagLine: PropTypes.oneOfType( [ PropTypes.string, PropTypes.node, PropTypes.element ] ),
	title: PropTypes.oneOfType( [ PropTypes.string, PropTypes.node, PropTypes.element ] ),

	// From localize HoC
	moment: PropTypes.func.isRequired,
	translate: PropTypes.func.isRequired,
};

export default localize( MyPlanCard );

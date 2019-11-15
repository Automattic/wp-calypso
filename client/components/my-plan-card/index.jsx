/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import PlanIcon from 'components/plans/plan-icon';

/**
 * Style dependencies
 */
import './style.scss';

const MyPlanCard = ( { action, isExpiring, isPlaceholder, expiration, plan, tagLine, title } ) => {
	const cardClassNames = classNames( 'my-plan-card', {
		'is-expiring': isExpiring,
		'has-action-only': action && ! expiration && ! isPlaceholder,
	} );
	const expirationClassNames = classNames( 'my-plan-card__expiration', {
		'is-placeholder': isPlaceholder && ! expiration,
	} );
	const actionClassNames = classNames( 'my-plan-card__action', {
		'is-placeholder': isPlaceholder && ! action,
	} );
	const hasSecondaryArea = expiration || action || isPlaceholder;

	return (
		<Card className={ cardClassNames } compact>
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
			{ hasSecondaryArea && (
				<div className="my-plan-card__secondary">
					<div className={ expirationClassNames }>{ expiration }</div>
					<div className={ actionClassNames }>{ action }</div>
				</div>
			) }
		</Card>
	);
};

MyPlanCard.propTypes = {
	action: PropTypes.oneOfType( [ PropTypes.node, PropTypes.element ] ),
	isExpiring: PropTypes.bool,
	isPlaceholder: PropTypes.bool,
	expiration: PropTypes.string,
	plan: PropTypes.string,
	tagLine: PropTypes.oneOfType( [ PropTypes.string, PropTypes.node, PropTypes.element ] ),
	title: PropTypes.oneOfType( [ PropTypes.string, PropTypes.node, PropTypes.element ] ),
};

export default MyPlanCard;

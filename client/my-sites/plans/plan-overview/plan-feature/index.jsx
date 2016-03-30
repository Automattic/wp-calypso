/**
 * External dependencies
 */
import classNames from 'classnames';
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import CompactCard from 'components/card/compact';
import Notice from 'components/notice';

const PlanFeature = ( { button, description, heading, willBeRemoved, removalMessage } ) => {
	const headingClasses = classNames( 'plan-feature__heading', {
		'will-be-removed': willBeRemoved
	} );

	return (
		<CompactCard className="plan-feature">
			<div>
				<strong className={ headingClasses }>{ heading }</strong>
				{ ! willBeRemoved && <span>{ description }</span> }
			</div>

			{ willBeRemoved && removalMessage &&
				<Notice isCompact status="is-warning">{ removalMessage }</Notice>
			}

			{ ! willBeRemoved && button &&
				<Button
					className="plan-feature__button"
					href={ button.href }
					compact>
					{ button.label }
				</Button>
			}
		</CompactCard>
	);
};

PlanFeature.propTypes = {
	button: React.PropTypes.shape( {
		label: React.PropTypes.string.isRequired,
		href: React.PropTypes.string.isRequired
	} ),
	description: React.PropTypes.string.isRequired,
	heading: React.PropTypes.string.isRequired,
	removalMessage: React.PropTypes.string,
	willBeRemoved: React.PropTypes.bool.isRequired
};

export default PlanFeature;

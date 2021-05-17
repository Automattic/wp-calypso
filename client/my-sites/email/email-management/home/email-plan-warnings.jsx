/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';

const EmailPlanWarnings = ( { warnings } ) =>
	warnings.map( ( warning, index ) => (
		<CompactCard highlight="info" className="email-plan-warnings__warning" key={ index }>
			<span>
				<em>{ warning.message }</em>
			</span>
		</CompactCard>
	) );

EmailPlanWarnings.propTypes = {
	warnings: PropTypes.array.isRequired,
};

export default EmailPlanWarnings;

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';

const SettingsGroupCard = ( { heading, children } ) => {
	return (
		<CompactCard className="settings-group-card">
			{ heading && (
				<FormSectionHeading className="settings-group-card__heading">
					{ heading }
				</FormSectionHeading>
			) }
			<div
				className={ classnames( 'settings-group-card__content', { 'is-full-width': ! heading } ) }
			>
				{ children }
			</div>
		</CompactCard>
	);
};

SettingsGroupCard.propTypes = {
	heading: PropTypes.node,
};

export default SettingsGroupCard;

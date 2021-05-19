/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import Gridicon from 'calypso/components/gridicon';

const EmailPlanWarnings = ( { warnings } ) => {
	const translate = useTranslate();

	if ( ! warnings?.[ 0 ] ) {
		return null;
	}

	return (
		<div className="email-plan-warnings__container">
			{ warnings.map( ( warning, index ) => (
				<div className="email-plan-warnings__warning" key={ index }>
					<span>{ warning.message }</span>
					<Button compact primary href={ 'controlPanelUrl' }>
						{ translate( 'Activate Mailboxes' ) }
						<Gridicon icon="external" size={ 18 } />
					</Button>
				</div>
			) ) }
		</div>
	);
};

EmailPlanWarnings.propTypes = {
	warnings: PropTypes.array,
};

export default EmailPlanWarnings;

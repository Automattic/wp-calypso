/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Gridicon from 'gridicons';

const SetupStart = ( { goToNextStep, translate } ) => (
	<CompactCard className="credentials-setup-flow__setup-start" onClick={ goToNextStep }>
		<Gridicon icon="add-outline" size={ 48 } className="credentials-setup-flow__header-gridicon" />
		<div className="credentials-setup-flow__header-text">
			<h3 className="credentials-setup-flow__header-text-title">{ translate( 'Add site credentials' ) }</h3>
			<h4 className="credentials-setup-flow__header-text-description">
				{ translate( 'Used to perform automatic actions on your server including backing up and restoring.' ) }
			</h4>
		</div>
	</CompactCard>
);

export default localize( SetupStart );

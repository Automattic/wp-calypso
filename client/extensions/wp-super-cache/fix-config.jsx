/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import SectionHeader from 'components/section-header';

const FixConfig = ( { translate } ) =>
	<div>
		<SectionHeader label={ translate( 'Fix Configuration' ) } />
		<Card>
			<Button compact>
				{ translate( 'Restore Default Configuration' ) }
			</Button>
		</Card>
	</div>;

export default localize( FixConfig );

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import WrapSettingsForm from './wrap-settings-form';

const FixConfig = ( { translate } ) => {
	return (
		<div>
			<SectionHeader label={ translate( 'Fix Configuration' ) } />
			<Card>
				<form>
					<div>
						<Button
							compact
							type="submit">
							{ translate( 'Restore Default Configuration' ) }
						</Button>
					</div>
				</form>
			</Card>
		</div>
	);
};

export default WrapSettingsForm()( FixConfig );

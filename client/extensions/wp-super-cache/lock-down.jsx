/**
 * External dependencies
 */
import React from 'react';
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import WrapSettingsForm from './wrap-settings-form';

const LockDown = ( {
	fields: {
		wp_lock_down,
	},
	translate,
} ) => {
	return (
		<div>
			<SectionHeader label={ !! wp_lock_down ? translate( 'Lock Down - Enabled' ) : translate( 'Lock Down - Disabled' ) } />
			<Card>
				<form>
					<p>
						{ translate(
							'Prepare your server for an expected spike in traffic by enabling the lock down. ' +
							'When this is enabled, new comments on a post will not refresh the cached static files.'
						) }
					</p>
					<p>
						{ translate(
							'Developers: Make your plugin lock down compatible by checking the "WPLOCKDOWN" ' +
							'constant. The following code will make sure your plugin respects the WPLOCKDOWN setting.'
						) }
					</p>
					<p>
						{ translate(
							'{{code}}if ( defined( \'WPLOCKDOWN\' ) && constant( \'WPLOCKDOWN\' ) ) { echo ' +
							'"Sorry. My blog is locked down. Updates will appear shortly"; }{{/code}}',
							{
								components: {
									code: <code />,
								}
							}
						) }
					</p>
					<p>
						{ !! wp_lock_down
							? translate( 'WordPress is locked down. Super Cache static files will not be deleted ' +
								'when new comments are made.' )
							: translate( 'WordPress is not locked down. New comments will refresh Super Cache static files as normal.' )
						}
					</p>
					<div>
						<Button
							compact
							type="submit">
							{ ! wp_lock_down ? translate( 'Enable Lock Down' ) : translate( 'Disable Lock Down' ) }
						</Button>
					</div>
				</form>
			</Card>
		</div>
	);
};

const getFormSettings = settings => {
	return pick( settings, [
		'wp_lock_down',
	] );
};

export default WrapSettingsForm( getFormSettings )( LockDown );

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
import Button from 'components/button';

const SetupTos = ( { autoConfigure, isPressable, reset, translate, goToNextStep } ) => (
	<CompactCard
		className="credentials-setup-flow__tos"
		highlight="info"
	>
		<Gridicon icon="info" size={ 48 } className="credentials-setup-flow__tos-gridicon" />
		<div className="credentials-setup-flow__tos-text">
			{
				isPressable
					? translate( 'WordPress.com can obtain the credentials from your ' +
					'current host which are necessary to perform site backups and ' +
					'restores. Do you want to give WordPress.com access to your ' +
					'host\'s server?' )
					: translate( 'By adding your site credentials, you are giving ' +
					'WordPress.com access to perform automatic actions on your ' +
					'server including backing up your site, restoring your site, ' +
					'as well as manually accessing your site in case of an emergency.' )
			}
		</div>
		<div className="credentials-setup-flow__tos-buttons">
			<Button borderless={ true } onClick={ reset }>{ translate( 'Cancel' ) }</Button>
			{
				isPressable
					? <Button primary onClick={ autoConfigure }>{ translate( 'Auto Configure' ) }</Button>
					: <Button primary onClick={ goToNextStep }>{ translate( 'Ok, I understand' ) }</Button>
			}
		</div>
	</CompactCard>
);

export default localize( SetupTos );

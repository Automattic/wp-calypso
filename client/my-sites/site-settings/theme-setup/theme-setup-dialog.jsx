/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import Button from 'components/button';

const ThemeSetupDialog = ( { isVisible, keepContent, onClose, site, translate } ) => {
	const buttonCancel = { action: 'cancel', label: translate( 'Cancel' ) };
	const buttonDeleteContent = (
		<Button
			primary
			scary
			disabled={ true }
			onClick={ () => {} }>
			{ translate( 'Set Up And Delete Content' ) }
		</Button>
	);
	const buttonKeepContent = (
		<Button
			primary
			onClick={ () => {} }>
			{ translate( 'Set Up And Keep Content' ) }
		</Button>
	);
	return (
		<div>
		{ keepContent ? (
			<Dialog
				isVisible={ isVisible }
				buttons= { [ buttonCancel, buttonKeepContent ] }
				onClose={ onClose }>
				<h1>{ translate( 'Confirm Theme Setup' ) }</h1>
				<p>
					{ translate( 'Settings will be changed on %(site)s, but no content will be deleted. These changes will be live immmediately. Do you want to proceed?', {
							args: {
								site: site.domain,
							}
					} ) }
				</p>
			</Dialog>
		) : (
			<Dialog
				isVisible={ isVisible }
				buttons= { [ buttonCancel, buttonDeleteContent ] }
				onClose={ onClose }>
				<h1>{ translate( 'Confirm Theme Setup' ) }</h1>
				<p>
					{ translate( 'Please type in {{warn}}delete{{/warn}} in the field below to confirm. {{strong}}All content on %(site)s will be deleted{{/strong}}, and then your site will be set up. These changes will be live immediately.', {
						components: {
							warn: <span className="theme-setup-dialog__confirm-text"/>,
							strong: <strong />,
						},
						args: {
							site: site.domain,
						},
					} ) }
				</p>
			</Dialog>
		) }
	</div>
	);
};

export default localize( ThemeSetupDialog );

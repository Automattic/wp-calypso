/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';

const ThemeSetupDialog = ( { isVisible, keepContent, onClose, site, translate } ) => {
	const buttonsKeepContent = [
		{ action: 'cancel', label: translate( 'Cancel' ) },
		{ action: 'setupKeepContent', label: translate( 'Set Up And Keep Content' ) },
	];
	const buttonsDeleteContent = [
		{ action: 'cancel', label: translate( 'Cancel' ) },
		{ action: 'setupDeleteContent', label: translate( 'Set Up And Delete Content' ) },
	];
	return (
		<div>
		{ keepContent ? (
			<Dialog isVisible={ isVisible } buttons= { buttonsKeepContent } onClose={ onClose }>
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
			<Dialog isVisible={ isVisible } buttons= { buttonsDeleteContent } onClose={ onClose }>
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

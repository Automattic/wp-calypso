/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button, Dialog } from '@automattic/components';

const DeleteZoneDialog = ( { onCancel, onConfirm, translate, zoneName } ) => {
	const buttons = [
		<Button onClick={ onCancel }>{ translate( 'Cancel' ) }</Button>,
		<Button primary scary onClick={ onConfirm }>
			{ translate( 'Delete' ) }
		</Button>,
	];

	return (
		<Dialog isVisible buttons={ buttons } onClose={ onCancel }>
			{ translate(
				'Are you sure you want to remove {{strong}}zone "%(zone)s"{{/strong}} from the site?{{br/}}' +
					'{{em}}This action cannot be reversed once completed.{{/em}}',
				{
					args: {
						zone: zoneName,
					},
					components: {
						br: <br />,
						em: <em />,
						strong: <strong />,
					},
				}
			) }
		</Dialog>
	);
};

DeleteZoneDialog.propTypes = {
	onCancel: PropTypes.func.isRequired,
	onConfirm: PropTypes.func.isRequired,
	translate: PropTypes.func.isRequired,
	zoneName: PropTypes.string,
};

DeleteZoneDialog.defaultProps = {
	zoneName: '',
};

export default localize( DeleteZoneDialog );

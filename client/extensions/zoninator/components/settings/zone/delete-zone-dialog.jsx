/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';

const DeleteZoneDialog = ( {
	onCancel,
	onConfirm,
	siteSlug,
	translate,
	zoneName,
} ) => {
	const buttons = [
		{ action: 'cancel', label: translate( 'Cancel' ), onClick: onCancel },
		{ action: 'delete', label: translate( 'Delete' ), onClick: onConfirm, isPrimary: true },
	];

	return (
		<Dialog isVisible buttons={ buttons } onClose={ onCancel }>
			{ translate(
				'Are you sure you want to remove {{strong}}zone "%(zone)s"{{/strong}} from %(site)s?{{br/}}' +
					'{{em}}This action cannot be reversed once completed.{{/em}}',
				{
					args: {
						zone: zoneName,
						site: siteSlug,
					},
					components: {
						br: <br />,
						em: <em />,
						strong: <strong />,
					},
				},
			) }
		</Dialog>
	);
};

DeleteZoneDialog.propTypes = {
	onCancel: PropTypes.func.isRequired,
	onConfirm: PropTypes.func.isRequired,
	siteSlug: PropTypes.string,
	translate: PropTypes.func.isRequired,
	zoneName: PropTypes.string,
};

DeleteZoneDialog.defaultProps = {
	siteSlug: '',
	zoneName: '',
};

export default localize( DeleteZoneDialog );

import { Dialog, Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { purchasesRoot } from 'calypso/me/purchases/paths';

import './style.scss';

function DeleteSiteWarningDialog( { isVisible, p2HubP2Count, onClose } ) {
	const translate = useTranslate();

	const getButtons = () => {
		const buttons = [ { action: 'dismiss', label: translate( 'Dismiss' ) } ];
		if ( p2HubP2Count ) {
			buttons.push(
				<Button primary href={ '/settings/general' }>
					{ translate( 'Go to your site listing' ) }
				</Button>
			);
		} else {
			buttons.push(
				<Button primary href={ purchasesRoot }>
					{ translate( 'Manage purchases', { context: 'button label' } ) }
				</Button>
			);
		}
		return buttons;
	};

	const getWarningHeader = () => {
		if ( p2HubP2Count ) {
			return translate( 'P2 workspace' );
		}
		return translate( 'Paid Upgrades' );
	};

	const getWarningContent = () => {
		if ( p2HubP2Count ) {
			return translate(
				'There is %(numP2s)d P2 in your workspace. Please delete it prior to deleting your workspace.',
				'There are %(numP2s)d P2s in your workspace. Please delete them prior to deleting your workspace.',
				{
					count: p2HubP2Count,
					args: {
						numP2s: p2HubP2Count,
					},
				}
			);
		}
		return translate(
			'You have active paid upgrades on your site. Please cancel your upgrades prior to deleting your site.'
		);
	};

	return (
		<Dialog
			isVisible={ isVisible }
			buttons={ getButtons() }
			onClose={ onClose }
			className="delete-site-warning-dialog"
		>
			<h1>{ getWarningHeader() }</h1>
			<p>{ getWarningContent() }</p>
		</Dialog>
	);
}

DeleteSiteWarningDialog.propTypes = {
	isVisible: PropTypes.bool.isRequired,
	p2HubP2Count: PropTypes.number,
	onClose: PropTypes.func.isRequired,
};

export default DeleteSiteWarningDialog;

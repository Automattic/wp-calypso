import { Dialog, Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { purchasesRoot } from 'calypso/me/purchases/paths';

import './style.scss';

function DeleteSiteWarningDialog( { isVisible, p2HubP2Count, onClose, isTrialSite = false } ) {
	const translate = useTranslate();

	const getButtons = () => {
		const buttons = [ { action: 'dismiss', label: translate( 'Dismiss' ) } ];
		if ( p2HubP2Count ) {
			buttons.push(
				<Button primary href="/settings/general">
					{ translate( 'Go to your site listing' ) }
				</Button>
			);
		} else if ( isTrialSite ) {
			buttons.push(
				<Button primary href={ purchasesRoot }>
					{ translate( 'Cancel trial', { context: 'button label' } ) }
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

	const renderWarningHeader = () => {
		if ( p2HubP2Count ) {
			return translate( 'P2 workspace' );
		}

		if ( isTrialSite ) {
			return translate( 'Free Trial Active' );
		}

		return translate( 'Paid Upgrades' );
	};

	const renderWarningContent = () => {
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

		if ( isTrialSite ) {
			return translate(
				'You have an active or expired free trial on your site. Please cancel this plan prior to deleting your site.'
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
			<h1>{ renderWarningHeader() }</h1>
			<p>{ renderWarningContent() }</p>
		</Dialog>
	);
}

DeleteSiteWarningDialog.propTypes = {
	isVisible: PropTypes.bool.isRequired,
	p2HubP2Count: PropTypes.number,
	onClose: PropTypes.func.isRequired,
	isTrialSite: PropTypes.bool,
};

export default DeleteSiteWarningDialog;

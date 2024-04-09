import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import ActionPanel from 'calypso/components/action-panel';
import ActionPanelBody from 'calypso/components/action-panel/body';
import { purchasesRoot } from 'calypso/me/purchases/paths';

function DeleteSiteWarningDialog( {
	isVisible,
	p2HubP2Count,
	onClose,
	isAtomicRemovalInProgress,
	isTrialSite = false,
} ) {
	const translate = useTranslate();

	const getButtons = () => {
		if ( isAtomicRemovalInProgress ) {
			return null;
		}

		if ( p2HubP2Count ) {
			return (
				<Button primary href="/settings/general">
					{ translate( 'Go to your site listing' ) }
				</Button>
			);
		} else if ( isTrialSite ) {
			return (
				<Button primary href={ purchasesRoot }>
					{ translate( 'Cancel trial', { context: 'button label' } ) }
				</Button>
			);
		}

		return (
			<Button primary href={ purchasesRoot }>
				{ translate( 'Manage purchases', { context: 'button label' } ) }
			</Button>
		);
	};

	const renderWarningContent = () => {
		if ( isAtomicRemovalInProgress ) {
			return translate(
				"We are still in the process of removing your previous plan. Please check back in a few minutes and you'll be able to delete your site."
			);
		}

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
		<ActionPanel>
			<ActionPanelBody
				isVisible={ isVisible }
				onClose={ onClose }
				className="delete-site-warning-dialog"
			>
				<p>{ renderWarningContent() }</p>
				{ getButtons() }
			</ActionPanelBody>
		</ActionPanel>
	);
}

DeleteSiteWarningDialog.propTypes = {
	isVisible: PropTypes.bool.isRequired,
	p2HubP2Count: PropTypes.number,
	onClose: PropTypes.func.isRequired,
	isTrialSite: PropTypes.bool,
};

export default DeleteSiteWarningDialog;

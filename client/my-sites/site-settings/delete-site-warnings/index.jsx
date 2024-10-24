import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import ActionPanel from 'calypso/components/action-panel';
import ActionPanelBody from 'calypso/components/action-panel/body';
import { purchasesRoot } from 'calypso/me/purchases/paths';
import { useSelector } from 'calypso/state';
import { getSite } from 'calypso/state/sites/selectors';

function DeleteSiteWarnings( { p2HubP2Count, isAtomicRemovalInProgress, isTrialSite = false } ) {
	const translate = useTranslate();
	const site = useSelector( ( state ) => getSite( state, 234130114 ) );

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
				<Button primary href={ purchasesRoot + '/' + site?.domain }>
					{ translate( 'Cancel trial', { context: 'button label' } ) }
				</Button>
			);
		}

		return (
			<Button primary href={ purchasesRoot + '/' + site?.domain }>
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
			<ActionPanelBody>
				<p>{ renderWarningContent() }</p>
				{ getButtons() }
			</ActionPanelBody>
		</ActionPanel>
	);
}

DeleteSiteWarnings.propTypes = {
	p2HubP2Count: PropTypes.number,
	isAtomicRemovalInProgress: PropTypes.bool,
	isTrialSite: PropTypes.bool,
};

export default DeleteSiteWarnings;

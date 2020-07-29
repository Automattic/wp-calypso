/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import { Card } from '@automattic/components';

/**
 * Internal dependencies
 */
import Task from 'my-sites/customer-home/cards/tasks/task';
import { TASK_FINISH_STORE_SETUP } from 'my-sites/customer-home/cards/constants';
import { getSiteUrl, getStoreSetup } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

/**
 * Style dependencies
 */
import './style.scss';

export const FinishStoreSetup = ( { siteUrl, storeSetup } ) => {
	const translate = useTranslate();
	const { remainingTasks, timing, totalTasks } = storeSetup;

	return (
		<Card className="finish-store-setup">
			<Task
				title={ translate( 'Finish store setup' ) }
				description={ translate(
					'You\'re not ready to receive orders until you complete store setup. There are just %d task left to finish, go get ´em!',
					'You\'re not ready to receive orders until you complete store setup. There are just %d tasks left to finish, go get ´em!', {
						count: remainingTasks,
						args: remainingTasks,
					},
				) }
				actionText={ translate( 'Finish store setup' ) }
				actionUrl={ `${ siteUrl }/wp-admin/admin.php?page=wc-admin` }
				remainingTasks= { remainingTasks }
				scary= { true }
				timing={ timing }
				taskId={ TASK_FINISH_STORE_SETUP }
				totalTasks= { totalTasks }
			/>
		</Card>
	);
};

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	return {
		siteUrl: getSiteUrl( state, siteId ),
		storeSetup: getStoreSetup( state, siteId ),
	};
};

export default connect( mapStateToProps )( FinishStoreSetup );

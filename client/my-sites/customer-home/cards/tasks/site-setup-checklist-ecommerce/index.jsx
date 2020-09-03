/**
 * External dependencies
 */
import { connect, useDispatch } from 'react-redux';
import { Button } from '@automattic/components';
import { Card } from '@automattic/components';
import classnames from 'classnames';
import { isDesktop } from '@automattic/viewport';
import React, { useRef, useState } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	bumpStat,
	composeAnalytics,
	recordTracksEvent,
	withAnalytics,
} from 'state/analytics/actions';
import Gauge from 'components/gauge';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteUrl } from 'state/sites/selectors';
import { getStoreSetupData } from 'state/store-setup/selectors';
import Gridicon from 'components/gridicon';
import PopoverMenu from 'components/popover/menu';
import PopoverMenuItem from 'components/popover/menu-item';
import { skipCurrentViewHomeLayout } from 'state/home/actions';
import Spinner from 'components/spinner';
import { TASK_SITE_SETUP_CHECKLIST_ECOMMERCE } from 'my-sites/customer-home/cards/constants';
import QueryStoreSetup from 'components/data/query-store-setup';

/**
 * Style dependencies
 */
import './style.scss';

export const SiteSetupListEcommerce = ( { siteId, siteUrl, storeSetup } ) => {
	const [ areSkipOptionsVisible, setSkipOptionsVisible ] = useState( false );
	const [ isLoading, setIsLoading ] = useState( false );
	const { remainingTasks, timing, totalTasks } = storeSetup;
	const skipButtonRef = useRef( null );
	const translate = useTranslate();
	const dispatch = useDispatch();

	const startTask = () => {
		dispatch( skipCurrentViewHomeLayout( siteId, null ) );
	};

	const skipTask = ( reminder = null ) => {
		setIsLoading( true );
		setSkipOptionsVisible( false );

		dispatch(
			withAnalytics(
				composeAnalytics(
					recordTracksEvent( 'calypso_customer_home_task_skip', {
						task: TASK_SITE_SETUP_CHECKLIST_ECOMMERCE,
						reminder,
					} ),
					bumpStat( 'calypso_customer_home', 'task_skip' )
				),
				skipCurrentViewHomeLayout( siteId, reminder )
			)
		);
	};

	return (
		<>
			<QueryStoreSetup />
			<Card className="site-setup-checklist-ecommerce">
				<div className={ classnames( 'task', { 'is-loading': isLoading } ) }>
					{ isLoading && <Spinner /> }
					<div className="task__text">
						{ timing && (
							<div className="task__timing">
								<Gridicon icon="time" size={ 18 } />
								{ translate( '%d minute', '%d minutes', { count: timing, args: [ timing ] } ) }
							</div>
						) }
						<h2 className="task__title">{ translate( 'Finish store setup' ) }</h2>
						<p className="task__description">
							{ translate(
								"You're not ready to receive orders until you complete store setup. There are just %d task left to finish, go get ´em!",
								"You're not ready to receive orders until you complete store setup. There are just %d tasks left to finish, go get ´em!",
								{
									count: remainingTasks,
									args: remainingTasks,
								}
							) }
						</p>
						<div className="task__actions">
							<Button
								className="task__action"
								primary
								onClick={ startTask }
								href={ `${ siteUrl }/wp-admin/admin.php?page=wc-admin` }
								target="_blank"
							>
								{ translate( 'Finish store setup' ) }
							</Button>

							<Button
								className="task__skip is-link"
								ref={ skipButtonRef }
								onClick={ () => setSkipOptionsVisible( true ) }
							>
								{ translate( 'Hide this' ) }
								<Gridicon icon="dropdown" size={ 18 } />
							</Button>
							{ areSkipOptionsVisible && (
								<PopoverMenu
									context={ skipButtonRef.current }
									isVisible={ areSkipOptionsVisible }
									onClose={ () => setSkipOptionsVisible( false ) }
									position="bottom"
									className="task__skip-popover"
								>
									<PopoverMenuItem onClick={ () => skipTask( '1d' ) }>
										{ translate( 'For a day' ) }
									</PopoverMenuItem>
									<PopoverMenuItem onClick={ () => skipTask( '1w' ) }>
										{ translate( 'For a week' ) }
									</PopoverMenuItem>
									<PopoverMenuItem onClick={ () => skipTask() }>
										{ translate( 'Forever' ) }
									</PopoverMenuItem>
								</PopoverMenu>
							) }
						</div>
					</div>
					{ /* { isDesktop() && (
						<div className="task__gauge">
							<Gauge percentage={ ( remainingTasks / totalTasks ) * 100 } metric={ '' } />
						</div>
					) } */ }
				</div>
			</Card>
		</>
	);
};

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	return {
		siteId,
		siteUrl: getSiteUrl( state, siteId ),
		storeSetup: getStoreSetupData( state, siteId ),
	};
};

export default connect( mapStateToProps )( SiteSetupListEcommerce );

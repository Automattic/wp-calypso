import { useTranslate } from 'i18n-calypso';
import { Fragment, FunctionComponent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import PostTypeList from 'calypso/my-sites/post-type-list';
import PostActionsEllipsisMenu from 'calypso/my-sites/post-type-list/post-actions-ellipsis-menu';
import PostActionsEllipsisMenuEdit from 'calypso/my-sites/post-type-list/post-actions-ellipsis-menu/edit';
import PostActionsEllipsisMenuTrash from 'calypso/my-sites/post-type-list/post-actions-ellipsis-menu/trash';
import threeDots from 'calypso/signup/difm/images/three-dots.svg';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import * as T from 'calypso/types';

import './style.scss';

export const MarketingTools: FunctionComponent = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId ) || 0;

	useEffect( () => {
		/*const script = document.createElement( 'script' );
		script.src = 'http://localhost:3005/widget.js';
		script.async = true;
		document.body.appendChild( script );*/

		setTimeout( () => {}, 5000 );

		/*window.BlazePress.render( {
			// apiHost: 'https://public-api.wordpress.com',
			apiHost: 'http://localhost:3003',
			// apiPrefix: `/wpcom/v2/sites/${ this.props.siteId }/wordads/dsp`,
			apiPrefix: ``,
			authToken: 'dev-test-token-user-1',
			stripeKey:
				'pk_test_51LAip3HQRXl8YKdespjL2eE9m5uGQrYPl7BWiRJQZ56ID1RBQQH323DgoUiRQg9uG4YZQiag3K7hvuDEjq8pxStW00hVJazNi6',
			template: 'article',
		} );*/
	}, [] );

	const campaigns = [
		{
			name: 'Linear Look at Life',
			status: 'Draft',
			startDate: 'July 14, 2022 - July 19, 2022',
		},
		{
			name: 'Auto Watering System',
			status: 'Draft',
			startDate: 'July 14, 2022 - July 19, 2022',
		},
		{
			name: 'Meet Ardugotchi!',
			status: 'Live',
			startDate: 'July 12, 2022 - July 17, 2022',
			reach: 1457,
			clicks: 72,
			clickthrought: ( ( 72 * 100 ) / 1457 ).toFixed( 2 ),
			budget: 20,
			days: 5,
		},
	];

	return (
		<Fragment>
			<QueryJetpackPlugins siteIds={ [ siteId ] } />
			<PageViewTracker path="/campaigns/all/:site" title="Marketing > Tools" />

			<ul className="tools__promoted">
				<li className="tools__promoted-title">Promoted posts</li>
				{ campaigns.map( ( campaign ) => {
					return (
						<li className="tools__promoted-element">
							<div className="tools__promoted-element-container">
								<li className="tools__promoted-element-status">
									{ campaign.status === 'Live' ? (
										<span>{ campaign.status }</span>
									) : (
										campaign.status
									) }
								</li>
								<li className="tools__promoted-element-name">{ campaign.name }</li>
								<li className="tools__promoted-element-extra">
									{ campaign.startDate }
									{ campaign.status !== 'Draft' && (
										<>
											<span>{ campaign.reach } Reached</span>
											<span>{ campaign.clicks } Clicks</span>
											<span>{ campaign.clickthrought }% Click-throught rate</span>
											<span>
												Spent ${ campaign.budget } over ${ campaign.days } days
											</span>
										</>
									) }
								</li>
							</div>

							{ /*	<PostTypeList
								query={ null }
								showPublishedStatus={ false }
								scrollContainer={ document.body }
							/>*/ }

							<img src={ threeDots } alt="three dots" />
						</li>
					);
				} ) }
			</ul>
		</Fragment>
	);
};

export default MarketingTools;

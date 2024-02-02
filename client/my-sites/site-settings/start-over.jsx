import { Button, FormLabel } from '@automattic/components';
import {
	useSiteResetContentSummaryQuery,
	useSiteResetMutation,
	useSiteResetStatusQuery,
} from '@automattic/data-stores';
import { useQueryClient } from '@tanstack/react-query';
import { createInterpolateElement, useState } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import ActionPanel from 'calypso/components/action-panel';
import ActionPanelBody from 'calypso/components/action-panel/body';
import ActionPanelFooter from 'calypso/components/action-panel/footer';
import FormTextInput from 'calypso/components/forms/form-text-input';
import HeaderCake from 'calypso/components/header-cake';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { LoadingBar } from 'calypso/components/loading-bar';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { EVERY_FIVE_SECONDS, Interval } from 'calypso/lib/interval';
import { useDispatch, useSelector } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import isUnlaunchedSite from 'calypso/state/selectors/is-unlaunched-site';
import { getSite, getSiteDomain, isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { BuiltByUpsell } from './built-by-upsell-banner';

function SiteResetCard( {
	translate,
	selectedSiteSlug,
	siteDomain,
	isAtomic,
	isUnlaunchedSite: isUnlaunchedSiteProp,
	site,
} ) {
	const siteId = useSelector( getSelectedSiteId );
	const dispatch = useDispatch();
	const queryClient = useQueryClient();

	const { data } = useSiteResetContentSummaryQuery( siteId );
	const { data: status, refetch: refetchResetStatus } = useSiteResetStatusQuery( siteId );
	const [ isDomainConfirmed, setDomainConfirmed ] = useState( false );
	const [ resetComplete, setResetComplete ] = useState( false );

	const checkStatus = async () => {
		if ( status?.status !== 'completed' && isAtomic ) {
			const {
				data: { status: latestStatus },
			} = await refetchResetStatus();

			if ( latestStatus === 'completed' ) {
				queryClient.invalidateQueries();
				dispatch(
					successNotice( translate( 'Your site was successfully reset' ), {
						id: 'site-reset-success-notice',
						duration: 4000,
					} )
				);
				setResetComplete( true );
			}
		}
	};

	const handleError = () => {
		dispatch(
			errorNotice( translate( 'We were unable to reset your site' ), {
				id: 'site-reset-failure-notice',
				duration: 6000,
			} )
		);
	};

	const handleResult = ( result ) => {
		if ( result.success ) {
			if ( isAtomic ) {
				refetchResetStatus();
			} else {
				queryClient.invalidateQueries();
				dispatch(
					successNotice( translate( 'Your site was successfully reset' ), {
						id: 'site-reset-success-notice',
						duration: 4000,
					} )
				);
				setResetComplete( true );
			}
		} else {
			handleError();
		}
	};

	const { resetSite, isLoading } = useSiteResetMutation( {
		onSuccess: handleResult,
		onError: handleError,
	} );

	const contentInfo = () => {
		const result = [];

		if ( data?.post_count > 0 ) {
			const message =
				data.post_count === 1
					? translate( '1 post' )
					: sprintf( translate( '%d posts' ), data.post_count );
			result.push( {
				message,
				url: `/posts/${ siteDomain }`,
			} );
		}

		if ( data?.page_count > 0 ) {
			const message =
				data.page_count === 1
					? translate( '1 page' )
					: sprintf( translate( '%d pages' ), data.page_count );
			result.push( {
				message,
				url: `/pages/${ siteDomain }`,
			} );
		}

		if ( data?.media_count > 0 ) {
			const message =
				data.media_count === 1
					? translate( '1 media item' )
					: sprintf( translate( '%d media items' ), data.media_count );
			result.push( {
				message,
				url: `/media/${ siteDomain }`,
			} );
		}

		if ( data?.plugin_count > 0 ) {
			const message =
				data.plugin_count === 1
					? translate( '1 plugin' )
					: sprintf( translate( '%d plugins' ), data.plugin_count );
			result.push( {
				message,
				url: `https://${ siteDomain }/wp-admin/plugins.php`,
			} );
		}
		return result;
	};

	const handleReset = async () => {
		if ( ! isDomainConfirmed ) {
			return;
		}
		resetSite( siteId );
		setDomainConfirmed( false );
	};

	const instructions = createInterpolateElement(
		sprintf(
			// translators: %s is the site domain
			translate(
				"Resetting <strong>%s</strong> will remove all of its content but keep the site and its URL up and running. Keep in mind you'll also lose any modifications you've made to your current theme."
			),
			siteDomain
		),
		{
			strong: <strong />,
		}
	);

	const backupHint = isAtomic
		? createInterpolateElement(
				translate(
					"Having second thoughts? Don't fret, you'll be able to restore your site using the most recent backup in the <a>Activity Log</a>."
				),
				{
					a: <a href={ `/activity-log/${ selectedSiteSlug }` } />,
				}
		  )
		: createInterpolateElement(
				translate(
					'To keep a copy of your current site, head to the <a>Export page</a> before starting the reset.'
				),
				{
					a: <a href={ `/settings/export/${ selectedSiteSlug }` } />,
				}
		  );

	const isResetInProgress = status?.status === 'in-progress' && isAtomic;

	const ctaText =
		! isAtomic && isLoading ? translate( 'Resetting site' ) : translate( 'Reset site' );

	const content = contentInfo();

	const renderBody = () => {
		if ( resetComplete ) {
			const message = createInterpolateElement(
				sprintf(
					// translators: %s is the site domain
					translate(
						'<strong>%s</strong> has been successfully reset and its content removed. Head to <a>My Home</a> to start building your new site.'
					),
					siteDomain
				),
				{
					strong: <strong />,
					a: <a href={ `/home/${ selectedSiteSlug }` } />,
				}
			);
			return (
				<ActionPanel style={ { margin: 0 } }>
					<ActionPanelBody>
						<p>{ message }</p>
					</ActionPanelBody>
				</ActionPanel>
			);
		} else if ( isResetInProgress ) {
			return (
				<ActionPanel style={ { margin: 0 } }>
					<ActionPanelBody>
						<LoadingBar progress={ status?.progress } />
						<p className="reset-site__in-progress-message">
							{ translate( "We're resetting your site. We'll email you once it's ready." ) }
						</p>
					</ActionPanelBody>
				</ActionPanel>
			);
		}
		return (
			<ActionPanel style={ { margin: 0 } }>
				<ActionPanelBody>
					<p>{ instructions }</p>
					{ content.length > 0 && (
						<>
							<p>{ translate( 'The following content will be removed:' ) }</p>
							<ul>
								{ content.map( ( { message, url } ) => {
									if ( url ) {
										return (
											<li key={ message }>
												<a href={ url }>{ message }</a>
											</li>
										);
									}
									return <li key={ message }>{ message }</li>;
								} ) }
							</ul>
						</>
					) }
				</ActionPanelBody>
				<ActionPanelFooter>
					<FormLabel htmlFor="confirmResetInput" className="reset-site__confirm-label">
						{ createInterpolateElement(
							sprintf(
								// translators: %s is the site domain
								translate(
									"Type <strong>%s</strong> below to confirm you're ready to reset the site:"
								),
								siteDomain
							),
							{
								strong: <strong />,
							}
						) }
					</FormLabel>
					<div className="site-settings__reset-site-controls">
						<FormTextInput
							autoCapitalize="off"
							aria-required="true"
							id="confirmResetInput"
							disabled={ isLoading }
							style={ { flex: 1 } }
							onChange={ ( event ) =>
								setDomainConfirmed( event.currentTarget.value.trim() === siteDomain )
							}
						/>
						<Button
							primary // eslint-disable-line wpcalypso/jsx-classname-namespace
							onClick={ handleReset }
							disabled={ isLoading || ! isDomainConfirmed }
							busy={ isLoading }
						>
							{ ctaText }
						</Button>
					</div>
					{ backupHint && <p className="site-settings__reset-site-backup-hint">{ backupHint }</p> }
				</ActionPanelFooter>
			</ActionPanel>
		);
	};

	return (
		<Main className="site-settings__reset-site">
			{ ! isLoading && <Interval onTick={ checkStatus } period={ EVERY_FIVE_SECONDS } /> }
			<NavigationHeader
				navigationItems={ [] }
				title={ translate( 'Site Reset' ) }
				subtitle={ translate(
					"Remove all posts, pages, and media to start fresh while keeping your site's address. {{a}}Learn more.{{/a}}",
					{
						components: {
							a: <InlineSupportLink supportContext="site-reset" showIcon={ false } />,
						},
					}
				) }
			/>
			<PageViewTracker path="/settings/start-reset/:site" title="Settings > Site Reset" />
			<HeaderCake backHref={ '/settings/general/' + selectedSiteSlug }>
				<h1>{ translate( 'Site Reset' ) }</h1>
			</HeaderCake>
			{ renderBody() }
			<BuiltByUpsell
				site={ site }
				isUnlaunchedSite={ isUnlaunchedSiteProp }
				urlRef="unlaunched-site-reset"
			/>
		</Main>
	);
}

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const siteDomain = getSiteDomain( state, siteId );
	const site = getSite( state, siteId );
	return {
		siteDomain,
		site,
		selectedSiteSlug: getSelectedSiteSlug( state ),
		isAtomic: isJetpackSite( state, siteId ),
		isUnlaunchedSite: isUnlaunchedSite( state, siteId ),
	};
} )( localize( SiteResetCard ) );

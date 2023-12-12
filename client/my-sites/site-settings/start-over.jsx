import { isEnabled } from '@automattic/calypso-config';
import { Button, Gridicon } from '@automattic/components';
import {
	useSiteResetContentSummaryQuery,
	useSiteResetMutation,
	useSiteResetStatusQuery,
} from '@automattic/data-stores';
import { useLocalizeUrl } from '@automattic/i18n-utils';
import { createInterpolateElement, useState } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import ActionPanel from 'calypso/components/action-panel';
import ActionPanelBody from 'calypso/components/action-panel/body';
import ActionPanelFigure from 'calypso/components/action-panel/figure';
import ActionPanelFooter from 'calypso/components/action-panel/footer';
import ActionPanelTitle from 'calypso/components/action-panel/title';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import HeaderCake from 'calypso/components/header-cake';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { LoadingBar } from 'calypso/components/loading-bar';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { EVERY_FIVE_SECONDS, Interval } from 'calypso/lib/interval';
import { EMPTY_SITE } from 'calypso/lib/url/support';
import { useDispatch, useSelector } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import isUnlaunchedSite from 'calypso/state/selectors/is-unlaunched-site';
import { getSite, getSiteDomain, isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { BuiltByUpsell } from './built-by-upsell-banner';

const StartOver = ( {
	translate,
	selectedSiteSlug,
	siteDomain,
	isAtomic,
	site,
	isUnlaunchedSite: isUnlaunchedSiteProp,
} ) => {
	const localizeUrl = useLocalizeUrl();
	if ( isEnabled( 'settings/self-serve-site-reset' ) ) {
		return (
			<SiteResetCard
				translate={ translate }
				selectedSiteSlug={ selectedSiteSlug }
				siteDomain={ siteDomain }
				isAtomic={ isAtomic }
				site={ site }
				isUnlaunchedSite={ isUnlaunchedSiteProp }
			/>
		);
	}
	return (
		<div
			className="main main-column" // eslint-disable-line wpcalypso/jsx-classname-namespace
			role="main"
		>
			<PageViewTracker path="/settings/start-over/:site" title="Settings > Start Over" />
			<HeaderCake backHref={ '/settings/general/' + selectedSiteSlug }>
				<h1>{ translate( 'Start Over' ) }</h1>
			</HeaderCake>
			<ActionPanel>
				<ActionPanelBody>
					<ActionPanelFigure inlineBodyText={ true }>
						<img src="/calypso/images/wordpress/logo-stars.svg" alt="" width="170" height="143" />
					</ActionPanelFigure>
					<ActionPanelTitle>{ translate( 'Start Over' ) }</ActionPanelTitle>
					<p>
						{ translate(
							"If you want a site but don't want any of the posts and pages you have now, our support " +
								'team can delete your posts, pages, media, and comments for you.'
						) }
					</p>
					<p>
						{ translate(
							'This will keep your site and URL active, but give you a fresh start on your content ' +
								'creation. Just contact us to have your current content cleared out.'
						) }
					</p>
					<p>
						{ translate(
							'Alternatively, you can delete all content from your site by following the steps here.'
						) }
					</p>
				</ActionPanelBody>
				<ActionPanelFooter>
					<Button
						className="action-panel__support-button is-external" // eslint-disable-line wpcalypso/jsx-classname-namespace
						href={ localizeUrl( EMPTY_SITE ) }
					>
						{ translate( 'Follow the steps' ) }
						<Gridicon icon="external" size={ 48 } />
					</Button>
					<Button
						className="action-panel__support-button" // eslint-disable-line wpcalypso/jsx-classname-namespace
						href="/help/contact"
					>
						{ translate( 'Contact support' ) }
					</Button>
				</ActionPanelFooter>
			</ActionPanel>
		</div>
	);
};

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

	const { data } = useSiteResetContentSummaryQuery( siteId );
	const { data: status, refetch: refetchResetStatus } = useSiteResetStatusQuery( siteId );
	let resetStatus = 'ready';
	if ( status ) {
		resetStatus = status.status;
	}
	const [ isDomainConfirmed, setDomainConfirmed ] = useState( false );
	const [ resetProgress, setResetProgress ] = useState( 1 );

	if ( resetStatus !== 'ready' && resetProgress === 1 ) {
		//it's already in progress on load
		setResetProgress( 0 );
	}

	const checkStatus = async () => {
		if ( resetProgress !== 1 ) {
			const {
				data: { status: latestStatus },
			} = await refetchResetStatus();
			if ( latestStatus === 'ready' ) {
				setResetProgress( 1 );
				dispatch(
					successNotice( translate( 'Your site has been reset.' ), {
						id: 'site-reset-success-notice',
						duration: 4000,
					} )
				);
			}
		}
	};

	const handleError = () => {
		dispatch(
			errorNotice( translate( 'We were unable to reset your site.' ), {
				id: 'site-reset-failure-notice',
				duration: 6000,
			} )
		);
	};

	const handleResult = ( result ) => {
		setResetProgress( 0 );
		if ( result.success ) {
			if ( isAtomic ) {
				dispatch(
					successNotice( translate( 'Your site will be reset. ' ), {
						id: 'site-reset-success-notice',
						duration: 6000,
					} )
				);
			} else {
				dispatch(
					successNotice( translate( 'Your site has been reset.' ), {
						id: 'site-reset-success-notice',
						duration: 4000,
					} )
				);
				setResetProgress( 1 );
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
					"Having second thoughts? Don't fret, we'll automatically back up your site content before the reset and you can restore it any time from the <a>Activity Log</a>."
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

	const isResetInProgress = resetProgress < 1;

	const ctaText =
		! isAtomic && isLoading ? translate( 'Resetting site' ) : translate( 'Reset site' );

	return (
		<Main className="site-settings__reset-site">
			<Interval onTick={ checkStatus } period={ EVERY_FIVE_SECONDS } />
			<NavigationHeader
				navigationItems={ [] }
				title={ translate( 'Reset your site' ) }
				subtitle={ translate(
					"Remove all posts, pages, and media to start fresh while keeping your site's address. {{a}}Learn more.{{/a}}",
					{
						components: {
							a: <InlineSupportLink supportContext="site-transfer" showIcon={ false } />,
						},
					}
				) }
			/>
			<PageViewTracker path="/settings/start-reset/:site" title="Settings > Site Reset" />
			<HeaderCake backHref={ '/settings/general/' + selectedSiteSlug }>
				<h1>{ translate( 'Site Reset' ) }</h1>
			</HeaderCake>
			{ isResetInProgress ? (
				<ActionPanel style={ { margin: 0 } }>
					<ActionPanelBody>
						<LoadingBar progress={ resetProgress / 100 } />
						<p className="reset-site__in-progress-message">
							{ translate( "We're resetting your site. We'll email you once it's ready." ) }
						</p>
					</ActionPanelBody>
				</ActionPanel>
			) : (
				<ActionPanel style={ { margin: 0 } }>
					<ActionPanelBody>
						<p>{ instructions }</p>
						<p>{ translate( 'The following content will be removed:' ) }</p>
						<ul>
							{ contentInfo().map( ( { message, url } ) => {
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
								style={ { flex: 0.5 } }
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
						{ backupHint && (
							<p className="site-settings__reset-site-backup-hint">{ backupHint }</p>
						) }
					</ActionPanelFooter>
				</ActionPanel>
			) }
			<BuiltByUpsell site={ site } isUnlaunchedSite={ isUnlaunchedSiteProp } />
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
} )( localize( StartOver ) );

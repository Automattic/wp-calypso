import { isEnabled } from '@automattic/calypso-config';
import { Button, Gridicon } from '@automattic/components';
import { useSiteResetMutation } from '@automattic/data-stores';
import { isSiteAtomic } from '@automattic/data-stores/src/site/selectors';
import { useLocalizeUrl } from '@automattic/i18n-utils';
import { createInterpolateElement } from '@wordpress/element';
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
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { EMPTY_SITE } from 'calypso/lib/url/support';
import { useDispatch, useSelector } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import isUnlaunchedSite from 'calypso/state/selectors/is-unlaunched-site';
import { getSite, getSiteDomain } from 'calypso/state/sites/selectors';
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

	const handleError = () => {
		dispatch(
			errorNotice( translate( 'We were unable to reset your site.' ), {
				id: 'site-reset-failure-notice',
				duration: 6000,
			} )
		);
	};

	const handleResult = ( result ) => {
		if ( result.success ) {
			dispatch(
				successNotice( translate( 'Your site has been reset.' ), {
					id: 'site-reset-success-notice',
					duration: 4000,
				} )
			);
		} else {
			handleError();
		}
	};

	const { resetSite, isLoading } = useSiteResetMutation( {
		onSuccess: handleResult,
		onError: handleError,
	} );

	const contentInfo = [
		translate( 'posts' ),
		translate( 'pages' ),
		translate( 'user installed plugins' ),
		translate( 'user themes' ),
	];

	const handleReset = () => {
		resetSite( siteId );
	};

	const instructions = ! isAtomic
		? createInterpolateElement(
				sprintf(
					// translators: %s is the site domain
					translate(
						'Resetting <strong>%s</strong> will remove all of its content but keep the site and its URL active. ' +
							'If you want to keep a copy of your current site, head to the <a>Export page</a> before reseting your site.'
					),
					siteDomain
				),
				{
					strong: <strong />,
					a: <a href={ `/settings/export/${ selectedSiteSlug }` } />,
				}
		  )
		: createInterpolateElement(
				sprintf(
					// translators: %s is the site domain
					translate(
						'Resetting <strong>%s</strong> will remove all of its content but keep the site and its URL active. '
					),
					siteDomain
				),
				{
					strong: <strong />,
				}
		  );

	return (
		<Main className="site-settings__reset-site">
			<NavigationHeader
				navigationItems={ [] }
				title={ translate( 'Site Reset' ) }
				subtitle={ translate(
					"Keep your site's address and theme, but delete all posts, pages, and media to start fresh. {{a}}Learn more.{{/a}}",
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
			<ActionPanel style={ { margin: 0 } }>
				<ActionPanelBody>
					<p>{ instructions }</p>
					<p>{ translate( 'The following content will be removed:' ) }</p>
					<ul>
						{ contentInfo.map( ( content ) => (
							<li key={ content }>{ content }</li>
						) ) }
					</ul>
				</ActionPanelBody>
				<ActionPanelFooter>
					<FormLabel htmlFor="confirmResetInput" className="reset-site__confirm-label">
						{ createInterpolateElement(
							sprintf(
								// translators: %s is the site domain
								translate( 'Enter <strong>%s</strong> to continue' ),
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
						/>
						<Button
							primary // eslint-disable-line wpcalypso/jsx-classname-namespace
							onClick={ handleReset }
							disabled={ isLoading }
							busy={ isLoading }
						>
							{ translate( 'Reset Site' ) }
						</Button>
					</div>
				</ActionPanelFooter>
			</ActionPanel>
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
		isAtomic: isSiteAtomic( state, siteId ),
		isUnlaunchedSite: isUnlaunchedSite( state, siteId ),
	};
} )( localize( StartOver ) );

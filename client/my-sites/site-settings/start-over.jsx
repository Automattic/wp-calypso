import { isEnabled } from '@automattic/calypso-config';
import { Button, Gridicon } from '@automattic/components';
import { useSiteResetMutation, useSiteResetContentSummaryQuery } from '@automattic/data-stores';
import { isSiteAtomic } from '@automattic/data-stores/src/site/selectors';
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
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { EMPTY_SITE } from 'calypso/lib/url/support';
import { useDispatch, useSelector } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { getSiteDomain } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const StartOver = ( { translate, selectedSiteSlug, siteDomain, isAtomic } ) => {
	const localizeUrl = useLocalizeUrl();
	if ( isEnabled( 'settings/self-serve-site-reset' ) ) {
		return (
			<SiteResetCard
				translate={ translate }
				selectedSiteSlug={ selectedSiteSlug }
				siteDomain={ siteDomain }
				isAtomic={ isAtomic }
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

function SiteResetCard( { translate, selectedSiteSlug, siteDomain, isAtomic } ) {
	const siteId = useSelector( getSelectedSiteId );
	const dispatch = useDispatch();

	const { data } = useSiteResetContentSummaryQuery( siteId );
	const [ siteDomainTest, setSiteDomainTest ] = useState( '' );

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

		result.push( {
			message: translate( 'All theme modifications you made' ),
		} );
		return result;
	};

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

	const canReset = siteDomainTest.trim() === siteDomain;

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
							value={ siteDomainTest }
							onChange={ ( event ) => setSiteDomainTest( event.currentTarget.value ) }
						/>
						<Button
							primary // eslint-disable-line wpcalypso/jsx-classname-namespace
							onClick={ handleReset }
							disabled={ isLoading || ! canReset }
							busy={ isLoading }
						>
							{ translate( 'Reset Site' ) }
						</Button>
					</div>
				</ActionPanelFooter>
			</ActionPanel>
		</Main>
	);
}

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const siteDomain = getSiteDomain( state, siteId );
	return {
		siteDomain,
		selectedSiteSlug: getSelectedSiteSlug( state ),
		isAtomic: isSiteAtomic( state, siteId ),
	};
} )( localize( StartOver ) );

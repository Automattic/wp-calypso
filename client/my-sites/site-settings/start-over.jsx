import { isEnabled } from '@automattic/calypso-config';
import { Button, Gridicon } from '@automattic/components';
import { useSiteResetMutation } from '@automattic/data-stores/';
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
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { EMPTY_SITE } from 'calypso/lib/url/support';
import { useDispatch, useSelector } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { getSiteDomain } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const StartOver = ( { translate, selectedSiteSlug, siteDomain } ) => {
	const localizeUrl = useLocalizeUrl();
	if ( isEnabled( 'settings/self-serve-site-reset' ) ) {
		return (
			<SiteResetCard
				translate={ translate }
				selectedSiteSlug={ selectedSiteSlug }
				siteDomain={ siteDomain }
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

function SiteResetCard( { translate, selectedSiteSlug, siteDomain } ) {
	const siteId = useSelector( getSelectedSiteId );
	const dispatch = useDispatch();
	const [ disabled, setDisabled ] = useState( false );

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

	const { resetSite } = useSiteResetMutation( { onSuccess: handleResult, onError: handleError } );

	const contentInfo = [
		translate( 'posts' ),
		translate( 'pages' ),
		translate( 'user installed plugins' ),
		translate( 'user themes' ),
	];

	const handleReset = async () => {
		try {
			setDisabled( true );
			await resetSite( siteId );
		} finally {
			setDisabled( false );
		}
	};

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
						{ createInterpolateElement(
							sprintf(
								// translators: %s is the site domain
								translate( 'Resetting <strong>%s</strong> will remove all of my content includes' ),
								siteDomain
							),
							{
								strong: <strong />,
							}
						) }
					</p>
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
							disabled={ disabled }
							style={ { flex: 2 } }
						/>
						<Button
							style={ { flex: '1' } }
							primary // eslint-disable-line wpcalypso/jsx-classname-namespace
							onClick={ handleReset }
							disabled={ disabled }
							busy={ disabled }
						>
							{ translate( 'Reset Site' ) }
						</Button>
					</div>
				</ActionPanelFooter>
			</ActionPanel>
		</div>
	);
}

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const siteDomain = getSiteDomain( state, siteId );
	return {
		siteDomain,
		selectedSiteSlug: getSelectedSiteSlug( state ),
	};
} )( localize( StartOver ) );

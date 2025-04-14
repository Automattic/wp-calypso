import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import FormTextInput from 'calypso/components/forms/form-text-input';
import HeaderCakeBack from 'calypso/components/header-cake/back';
import InlineSupportLink from 'calypso/components/inline-support-link';
import NavigationHeader from 'calypso/components/navigation-header';
import { Panel, PanelCard, PanelCardHeading } from 'calypso/components/panel';
import { useRemoveDuplicateViewsExperimentEnabled } from 'calypso/lib/remove-duplicate-views-experiment';
import { getSettingsSource } from 'calypso/my-sites/site-settings/site-tools/utils';
import { useDispatch, useSelector } from 'calypso/state';
import { getSiteDomain } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { useSetFeatureBreadcrumb } from '../../../../hooks/breadcrumbs/use-set-feature-breadcrumb';

import './style.scss';

const LeaveSite = () => {
	const translate = useTranslate();
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const selectedSiteSlug = useSelector( ( state ) => getSelectedSiteSlug( state ) );
	const siteDomain = useSelector( ( state ) => getSiteDomain( state, siteId ) );
	const dispatch = useDispatch(); // eslint-disable-line no-unused-vars
	const [ confirmDomain, setConfirmDomain ] = useState( '' );
	const [ isLeavingSite, setIsLeavingSite ] = useState( false );

	const isUntangled = useRemoveDuplicateViewsExperimentEnabled();

	const title = translate( 'Leave site' );
	const source = isUntangled ? '/sites/settings/site' : getSettingsSource();
	const isDisabled =
		! siteId ||
		typeof confirmDomain !== 'string' ||
		confirmDomain.replace( /\s/g, '' ) !== siteDomain;

	const handleConfirmDomainChange = ( event ) => {
		setConfirmDomain( event.target.value );
	};

	const handleLeaveSiteClick = async () => {
		try {
			setIsLeavingSite( true );
			page.redirect( '/sites' );
		} finally {
			setIsLeavingSite( false );
		}
	};

	useSetFeatureBreadcrumb( { siteId, title } );

	return (
		<Panel className="settings-administration__leave-site">
			{ ! isUntangled && (
				<HeaderCakeBack icon="chevron-left" href={ `${ source }/${ selectedSiteSlug }` } />
			) }
			<NavigationHeader
				compactBreadcrumb={ false }
				navigationItems={ [] }
				mobileItem={ null }
				title={ title }
				subtitle={ translate( 'Leave this site and remove your access. {{a}}Learn more.{{/a}}', {
					components: {
						a: <InlineSupportLink supportContext="site-leave" showIcon={ false } />,
					},
				} ) }
			/>
			<PanelCard>
				{ isUntangled && (
					<PanelCardHeading>{ translate( 'Confirm site leave' ) }</PanelCardHeading>
				) }
				<div>
					<p>
						{ translate(
							'Leaving will {{strong}}remove your access to the site{{/strong}} — this includes posts, pages, media, users, authors, domains, purchased upgrades, and anything else you have access to.',
							{
								components: {
									strong: <strong />,
								},
							}
						) }
					</p>
					<p>
						{ translate(
							'You will not be sent any confirmation email. To get access back, you will need to contact a current administrator to invite you back to the site. Please make sure this is what you want to do before continuing.'
						) }
					</p>
				</div>
				<p>
					{ translate(
						'Type {{strong}}%(siteDomain)s{{/strong}} below to confirm you want to leave the site:',
						{
							components: {
								strong: <strong />,
							},
							args: {
								siteDomain,
							},
						}
					) }
				</p>
				<FormTextInput
					autoCapitalize="off"
					className="leave-site__confirm-input"
					onChange={ handleConfirmDomainChange }
					value={ confirmDomain }
					aria-required="true"
				/>
				<Button
					primary
					busy={ isLeavingSite }
					disabled={ isDisabled }
					onClick={ handleLeaveSiteClick }
				>
					{ translate( 'Leave site' ) }
				</Button>
			</PanelCard>
		</Panel>
	);
};

export default LeaveSite;

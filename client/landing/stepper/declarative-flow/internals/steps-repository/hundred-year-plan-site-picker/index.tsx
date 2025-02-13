import { recordTracksEvent } from '@automattic/calypso-analytics';
import { PLAN_100_YEARS, getPlan } from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { HelpCenter } from '@automattic/data-stores';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import styled from '@emotion/styled';
import { Button, Modal } from '@wordpress/components';
import { useDispatch as useDataStoreDispatch, useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import QuerySites from 'calypso/components/data/query-sites';
import FormattedHeader from 'calypso/components/formatted-header';
import SiteSelector from 'calypso/components/site-selector';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import HundredYearPlanStepWrapper from '../hundred-year-plan-step-wrapper';
import { SMALL_BREAKPOINT } from '../hundred-year-plan-step-wrapper/constants';
import type { Step } from '../../types';
import type { SiteDetails, SiteSelect } from '@automattic/data-stores';
import type { SiteId } from 'calypso/types';

import './styles.scss';

const StyledModal = styled( Modal )`
	max-width: 536px;
	.components-modal__content {
		padding: 0;
	}
`;

const Subtitle = styled.div< { width?: number } >`
	color: var( --studio-gray-80 );

	font-family: 'SF Pro Text', sans-serif;
	font-size: 16px;
	font-style: normal;
	font-weight: 500;
	line-height: 24px; /* 150% */
	letter-spacing: -0.32px;

	margin: 0 32px;

	width: ${ ( props ) => ( props.width ? `${ props.width }px` : 'initial' ) };
`;

const List = styled.div`
	margin: 24px 32px 32px 32px;
`;

const ListItem = styled.div< { width?: number } >`
	color: var( --studio-gray-60 );
	font-family: 'SF Pro Text', sans-serif;
	font-size: 14px;
	font-style: normal;
	font-weight: 400;
	line-height: 20px; /* 142.857% */
	letter-spacing: -0.15px;
	display: flex;
	align-items: center;
	gap: 10px;
	margin-bottom: 5px;
	width: ${ ( props ) => ( props.width ? `${ props.width }px` : 'initial' ) };
`;

const Footer = styled.div`
	border-top: 1px solid var( --gray-gray-0, #f6f7f7 );
	display: flex;
	padding: 16px 32px;
	justify-content: space-between;
	align-items: center;
	flex-direction: column-reverse;
	gap: 8px;
	@media ( min-width: ${ SMALL_BREAKPOINT }px ) {
		flex-direction: row;
	}
`;

const HelpLink = styled.div`
	color: var( --studio-gray-80 );

	font-family: 'SF Pro Text', sans-serif;
	font-size: 14px;
	font-style: normal;
	font-weight: 400;
	line-height: 20px; /* 142.857% */
	letter-spacing: -0.15px;

	.components-button.is-link {
		color: var( --studio-gray-80 );
	}
`;

const ButtonsContainer = styled.div`
	display: flex;
	gap: 8px;
	align-items: center;
	justify-content: space-between;
	align-self: center;
	@media ( min-width: ${ SMALL_BREAKPOINT }px ) {
		align-self: flex-end;
	}
`;

const StyledButton = styled( Button )< { variant: 'primary' | 'secondary' } >`
	&.components-button {
		padding: 10px 24px;
		border-radius: 4px;
	}
`;

const Placeholders = () => (
	<div>
		<Subtitle width={ 450 } className="is-placeholder" />
		<List>
			<ListItem width={ 250 } className="is-placeholder" />
			<ListItem width={ 250 } className="is-placeholder" />
			<ListItem width={ 250 } className="is-placeholder" />
			<ListItem width={ 250 } className="is-placeholder" />
			<ListItem width={ 250 } className="is-placeholder" />
		</List>
	</div>
);

const ConfirmationModal = ( {
	isFetching,
	siteTitle,
	siteDomain,
	siteId,
	onConfirm,
	closeModal,
}: {
	isFetching: boolean;
	siteTitle?: string;
	siteDomain?: string;
	siteId?: number;
	onConfirm: () => void;
	closeModal: () => void;
} ) => {
	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();

	const { setShowHelpCenter, setNavigateToRoute } = useDataStoreDispatch( HelpCenter.register() );

	const userFieldMessage =
		'Automated message: This is a user looking to purchase the 100-Year Plan and is currently in the site picker step: https://wordpress.com/setup/hundred-year-plan/site-picker';
	const helpCenterUrl = `/odie?provider=zendesk&userFieldMessage=${ encodeURIComponent(
		userFieldMessage
	) }&siteUrl=${ siteDomain }&siteId=${ siteId }`;

	const openHelpCenter = () => {
		recordTracksEvent( 'calypso_hundred_year_plan_help_click' );
		setNavigateToRoute( helpCenterUrl );
		setShowHelpCenter( true, true );
		closeModal();
	};

	return (
		<StyledModal
			overlayClassName="hundred-year-plan-site-picker__confirmation-modal-overlay"
			className="hundred-year-plan-site-picker__confirmation-modal"
			title={ translate( 'Confirm your site selection' ) }
			onRequestClose={ closeModal }
		>
			{ isFetching ? (
				<Placeholders />
			) : (
				<>
					<Subtitle>
						{ translate(
							'{{strong}}%(siteTitle)s (%(siteDomain)s){{/strong}} will be upgraded to the %(planTitle)s, and will benefit from these exclusive features:',
							{
								args: {
									siteTitle: siteTitle || '',
									siteDomain: siteDomain || '',
									planTitle: getPlan( PLAN_100_YEARS )?.getTitle() || '',
								},
								components: {
									strong: <strong />,
								},
							}
						) }
					</Subtitle>
					<List>
						<ListItem>
							<Gridicon icon="checkmark" size={ 16 } />
							{ translate( 'Century-long domain registration' ) }
						</ListItem>
						<ListItem>
							<Gridicon icon="checkmark" size={ 16 } />
							{ translate( 'Enhanced ownership protocols' ) }
						</ListItem>
						<ListItem>
							<Gridicon icon="checkmark" size={ 16 } />
							{ translate( 'Top-tier managed WordPress hosting' ) }
						</ListItem>
						<ListItem>
							<Gridicon icon="checkmark" size={ 16 } />
							{ translate( '24/7 Premier Support' ) }
						</ListItem>
						<ListItem>
							<Gridicon icon="checkmark" size={ 16 } />
							{ translate( 'Peace of mind' ) }
						</ListItem>
					</List>
					<Footer>
						<HelpLink>
							{ hasEnTranslation( 'Need help? {{ChatLink}}Contact us{{/ChatLink}}' )
								? translate( 'Need help? {{ChatLink}}Contact us{{/ChatLink}}', {
										components: {
											ChatLink: <Button variant="link" onClick={ openHelpCenter } />,
										},
								  } )
								: translate( 'Need help? {{ChatLink}}Chat with us{{/ChatLink}}', {
										components: {
											ChatLink: <Button variant="link" onClick={ openHelpCenter } />,
										},
								  } ) }
						</HelpLink>
						<ButtonsContainer>
							<StyledButton variant="secondary" onClick={ closeModal }>
								{ translate( 'Cancel' ) }
							</StyledButton>
							<StyledButton variant="primary" onClick={ onConfirm }>
								{ translate( 'Confirm' ) }
							</StyledButton>
						</ButtonsContainer>
					</Footer>
				</>
			) }
		</StyledModal>
	);
};

const HundredYearPlanSitePicker: Step = function HundredYearPlanSitePicker( { navigation, flow } ) {
	const translate = useTranslate();

	const [ selectedSiteId, setSelectedSiteId ] = useState< SiteId | null >( null );
	const [ showConfirmModal, setShowConfirmModal ] = useState( false );

	const siteDomain = useSelect(
		( select ) =>
			( selectedSiteId &&
				( select( SITE_STORE ) as SiteSelect ).getPrimarySiteDomain( selectedSiteId ) ) ||
			undefined,
		[ selectedSiteId ]
	);
	const siteTitle = useSelect(
		( select ) =>
			( selectedSiteId && ( select( SITE_STORE ) as SiteSelect ).getSiteTitle( selectedSiteId ) ) ||
			'',
		[ selectedSiteId ]
	);
	const site = useSelect(
		( select ) =>
			( selectedSiteId && ( select( SITE_STORE ) as SiteSelect ).getSite( selectedSiteId ) ) ||
			null,
		[ selectedSiteId ]
	);
	const isFetching = ! site || ! siteDomain || ! siteTitle;

	const selectSite = () => {
		const siteSlug = new URL( site?.URL || '' ).host;
		const siteId = site?.ID;
		if ( ! siteSlug || ! siteId ) {
			return;
		}
		navigation.submit?.( { siteSlug, siteId } );
	};

	const onSelectSite = ( siteId: SiteId ) => {
		setSelectedSiteId( siteId );
		setShowConfirmModal( true );
	};

	const closeModal = () => {
		setSelectedSiteId( null );
		setShowConfirmModal( false );
	};

	const filter = ( site: SiteDetails ) => {
		return !! (
			site.capabilities?.manage_options &&
			( site.is_wpcom_atomic || ! site.jetpack ) &&
			! site.options?.is_wpforteams_site &&
			! site.is_wpcom_staging_site
		);
	};

	return (
		<>
			<HundredYearPlanStepWrapper
				stepName="hundred-year-plan-site-picker"
				stepContent={
					<div className="hundred-year-plan-site-picker__container">
						<QuerySites allSites />
						<SiteSelector filter={ filter } onSiteSelect={ onSelectSite } />
					</div>
				}
				formattedHeader={
					<FormattedHeader
						align="center"
						headerText={ translate( 'Select your site' ) }
						subHeaderText={ translate(
							'Start crafting your 100-Year legacy by appointing one of your sites.'
						) }
					/>
				}
				flowName={ flow }
			/>
			{ showConfirmModal && (
				<ConfirmationModal
					isFetching={ isFetching }
					onConfirm={ selectSite }
					closeModal={ closeModal }
					siteTitle={ siteTitle }
					siteDomain={ siteDomain?.domain }
					siteId={ site?.ID }
				/>
			) }
		</>
	);
};

export default HundredYearPlanSitePicker;

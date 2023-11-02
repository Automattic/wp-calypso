import { StepContainer } from '@automattic/onboarding';
import styled from '@emotion/styled';
import { Button, Modal } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import QuerySites from 'calypso/components/data/query-sites';
import FormattedHeader from 'calypso/components/formatted-header';
import SiteSelector from 'calypso/components/site-selector';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
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
`;

const ButtonsContainer = styled.div`
	display: flex;
	gap: 8px;
	align-items: center;
	justify-content: space-between;
	align-self: center;
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
	siteDomain,
	onConfirm,
	closeModal,
}: {
	isFetching: boolean;
	siteTitle?: string;
	siteDomain?: string;
	onConfirm: () => void;
	closeModal: () => void;
} ) => {
	const translate = useTranslate();

	return (
		<StyledModal
			overlayClassName="site-picker__confirmation-modal-overlay"
			className="site-picker__confirmation-modal"
			title={ translate( 'Confirm your site selection' ) }
			onRequestClose={ closeModal }
		>
			{ isFetching ? (
				<Placeholders />
			) : (
				<>
					<Subtitle>
						{ translate(
							'Starting with {{strong}}%(siteDomain)s{{/strong}} will reset content and customization of your site.{{br}}{{/br}}{{br}}{{/br}}Any blog posts and media uploads will be unpublished and saved.',
							{
								args: {
									siteDomain: siteDomain || '',
								},
								components: {
									strong: <strong />,
									br: <br />,
								},
							}
						) }
					</Subtitle>
					<Footer>
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

const SitePicker: Step = function SitePicker( { navigation, flow } ) {
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
			! site.is_wpcom_staging_site &&
			site.launch_status === 'unlaunched'
		);
	};

	return (
		<>
			<StepContainer
				stepName="site-picker"
				stepContent={
					<div className="site-picker__container">
						<QuerySites allSites />
						<SiteSelector filter={ filter } onSiteSelect={ onSelectSite } />
					</div>
				}
				formattedHeader={
					<FormattedHeader
						align="center"
						subHeaderAlign="center"
						headerText={ translate( 'Select your site' ) }
					/>
				}
				recordTracksEvent={ recordTracksEvent }
				flowName={ flow }
				hideBack={ true }
			/>
			{ showConfirmModal && (
				<ConfirmationModal
					isFetching={ isFetching }
					onConfirm={ selectSite }
					closeModal={ closeModal }
					siteTitle={ siteTitle }
					siteDomain={ siteDomain?.domain }
				/>
			) }
		</>
	);
};

export default SitePicker;

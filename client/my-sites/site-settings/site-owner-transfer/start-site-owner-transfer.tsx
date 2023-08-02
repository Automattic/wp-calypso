import { Button, Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { ToggleControl } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { localize, useTranslate } from 'i18n-calypso';
import { useState, FormEvent } from 'react';
import { connect, useSelector } from 'react-redux';
import ActionPanelBody from 'calypso/components/action-panel/body';
import Notice from 'calypso/components/notice';
import { ResponseDomain } from 'calypso/lib/domains/types';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { IAppState } from 'calypso/state/types';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { User } from './use-administrators';
import { useStartSiteOwnerTransfer } from './use-start-site-owner-transfer';
import type { Purchase } from 'calypso/lib/purchases/types';

type Props = {
	selectedSiteId: number | null;
	selectedSiteSlug: string | null;
	siteOwner: User;
	customDomains: ResponseDomain[];
	isAtomicSite: boolean | null;
	onSiteTransferSuccess: () => void;
	onSiteTransferError: () => void;
	translate: ( text: string, args?: Record< string, unknown > ) => string;
};

const FormToggleControl = styled( ToggleControl )( {
	fontSize: '14px',
} );

const FormWrapper = styled.div( {
	marginBottom: '1.5em',
} );

const ButtonContainer = styled.div( {
	marginTop: '1.5em',
} );

const Strong = styled( 'strong' )( {
	fontWeight: 500,
} );

const SiteOwnerTransferActionPanelBody = styled( ActionPanelBody )( {
	overflow: 'visible !important',
} );

const Title = styled.h2( {
	fontWeight: 500,
	marginBottom: '1em',
} );

const Text = styled.p( {
	marginBottom: '1.5em !important',
} );

const List = styled.ul( {
	marginLeft: '2em',
} );

const ListItem = styled.li( {
	marginBottom: '0.25em',
} );

const DomainsWrapper = styled.div( {
	backgroundColor: '#F6F7F7',
	marginTop: '2em',
	marginBottom: '2em',
	paddingTop: '1em',
	paddingBottom: '1em',
} );

const DomainsWrapperItem = styled.div( {
	paddingLeft: '1em',
	fontWeight: 500,
} );

const GridiconStyled = styled( Gridicon )( {
	paddingRight: '10px',
	verticalAlign: 'middle',
} );

const DomainsCard = ( {
	domains,
	siteSlug,
	siteOwner,
}: {
	domains: ResponseDomain[];
	siteSlug: string | null;
	siteOwner: User;
} ) => {
	const translate = useTranslate();
	return (
		<>
			<Title>{ translate( 'Domains' ) }</Title>
			{ domains.length === 0 ? (
				<List>
					<ListItem>
						{ createInterpolateElement(
							sprintf(
								// translators: siteSlug is the current site slug, username is the user that the site is going to
								// transer to
								translate(
									'The domain name <strong>%(siteSlug)s</strong> will be transferred to <strong>%(username)s</strong> and will remain working on the site.'
								),
								{ siteSlug, username: siteOwner.login }
							),
							{ strong: <Strong /> }
						) }
					</ListItem>
				</List>
			) : (
				<>
					<Text>
						{ createInterpolateElement(
							sprintf(
								// translators: username is the user that the site is going to transfer to
								translate(
									'The following domains will be transferred to <strong>%(username)s</strong> and will remain working on the site:'
								),
								{ username: siteOwner.login }
							),
							{ strong: <Strong /> }
						) }
					</Text>
					<DomainsWrapper>
						{ domains.map( ( domain ) => (
							<DomainsWrapperItem key={ domain.name }>
								<GridiconStyled icon="domains" size={ 16 } />
								{ domain.name }
							</DomainsWrapperItem>
						) ) }
					</DomainsWrapper>
				</>
			) }
		</>
	);
};
const UpgradesCard = ( {
	purchases,
	siteSlug,
	siteOwner,
}: {
	purchases: Purchase[];
	siteSlug: string | null;
	siteOwner: User;
} ) => {
	const translate = useTranslate();
	if ( purchases.length === 0 ) {
		return null;
	}
	return (
		<>
			<Title>{ translate( 'Upgrades' ) }</Title>
			<Text>
				{ createInterpolateElement(
					sprintf(
						// translators: siteSlug is the current site slug, username is the user that the site is going to
						// transer to
						translate(
							'Your paid upgrades on <strong>%(siteSlug)s</strong> will be transferred to <strong>%(username)s</strong> and will remain with the site.'
						),
						{ siteSlug, username: siteOwner.login }
					),
					{ strong: <Strong /> }
				) }
			</Text>
		</>
	);
};

const ContentAndOwnershipCard = ( {
	siteSlug,
	siteOwner,
	isAtomicSite,
}: {
	siteSlug: string | null;
	siteOwner: User;
	isAtomicSite: any;
} ) => {
	const translate = useTranslate();
	return (
		<>
			<Title>{ translate( 'Content and ownership' ) }</Title>
			<List>
				<ListItem>
					{ createInterpolateElement(
						sprintf(
							// translators: siteSlug is the current site slug, userInfo is the user that the site is going to
							// transer to
							translate(
								'You’ll be removed as owner of <strong>%(siteSlug)s</strong> and <strong>%(userInfo)s</strong> will be the new owner from now on.'
							),
							{ siteSlug, userInfo: `${ siteOwner.login } (${ siteOwner.email })` }
						),
						{ strong: <Strong /> }
					) }
				</ListItem>
				<ListItem>
					{ createInterpolateElement(
						sprintf(
							// translators: username is the user that the site is going to transer to
							translate(
								'You will keep your admin access unless <strong>%(username)s</strong> removes you.'
							),
							{ username: siteOwner.login }
						),
						{ strong: <Strong /> }
					) }
				</ListItem>
				<ListItem>
					{ createInterpolateElement(
						sprintf(
							// translators: siteSlug is the current site slug
							translate(
								'Your posts on <strong>%(siteSlug)s</strong> will remain authored by your account.'
							),
							{ siteSlug }
						),
						{ strong: <Strong /> }
					) }
				</ListItem>
				{ isAtomicSite && (
					<ListItem>
						{ createInterpolateElement(
							sprintf(
								// translators: siteSlug is the current site slug, username is the user that the site will be transerred to
								translate(
									'If your site <strong>%(siteSlug)s</strong> has a staging site, it will be transferred to <strong>%(username)s</strong>.'
								),
								{ siteSlug, username: siteOwner.login }
							),
							{ strong: <Strong /> }
						) }
					</ListItem>
				) }
			</List>
		</>
	);
};

const StartSiteOwnerTransfer = ( {
	selectedSiteId,
	selectedSiteSlug,
	siteOwner,
	customDomains,
	isAtomicSite,
	onSiteTransferSuccess,
	onSiteTransferError,
	translate,
}: Props ) => {
	const [ confirmFirstToggle, setConfirmFirstToggle ] = useState( false );
	const [ confirmSecondToggle, setConfirmSecondToggle ] = useState( false );
	const [ confirmThirdToggle, setConfirmThirdToggle ] = useState( false );
	const [ startSiteTransferError, setStartSiteTransferError ] = useState( '' );
	const [ startSiteTransferSuccess, setStartSiteTransferSuccess ] = useState( false );

	const purchases = useSelector( ( state ) => getSitePurchases( state, selectedSiteId ) );

	const { startSiteOwnerTransfer, isLoading: isStartingSiteTransfer } = useStartSiteOwnerTransfer(
		selectedSiteId,
		{
			onMutate: () => {
				setStartSiteTransferError( '' );
				setStartSiteTransferSuccess( false );
			},
			onError: ( error ) => {
				setStartSiteTransferError( error.message );
				onSiteTransferError?.();
			},
			onSuccess: () => {
				setStartSiteTransferSuccess( true );
				onSiteTransferSuccess?.();
			},
		}
	);

	const handleFormSubmit = ( event: FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		if ( ! siteOwner?.email ) {
			return;
		}
		startSiteOwnerTransfer( { newSiteOwner: siteOwner.email } );
	};

	const startSiteTransferForm = (
		<FormWrapper>
			<p>
				<Strong>
					{ translate( 'To transfer your site, review and accept the following statements:' ) }
				</Strong>
			</p>
			<FormToggleControl
				disabled={ false }
				label={ translate(
					'I understand the changes that will be made once I authorize this transfer.'
				) }
				checked={ confirmFirstToggle }
				onChange={ () => setConfirmFirstToggle( ! confirmFirstToggle ) }
			/>
			<FormToggleControl
				disabled={ false }
				label={
					purchases.length === 0
						? translate( 'I want to transfer the ownership of the site' )
						: translate( 'I want to transfer ownership of the site and all my related upgrades.' )
				}
				checked={ confirmSecondToggle }
				onChange={ () => setConfirmSecondToggle( ! confirmSecondToggle ) }
			/>
			<FormToggleControl
				disabled={ false }
				label={ translate( 'I understand that transferring a site cannot be undone.' ) }
				checked={ confirmThirdToggle }
				onChange={ () => setConfirmThirdToggle( ! confirmThirdToggle ) }
			/>
			<form onSubmit={ handleFormSubmit }>
				{ startSiteTransferError && (
					<Notice status="is-error" showDismiss={ false }>
						{ startSiteTransferError }
					</Notice>
				) }
				<ButtonContainer>
					<Button
						busy={ isStartingSiteTransfer }
						primary
						disabled={
							! siteOwner ||
							isStartingSiteTransfer ||
							! ( confirmFirstToggle && confirmSecondToggle && confirmThirdToggle )
						}
						type="submit"
					>
						{ translate( 'Start transfer' ) }
					</Button>
				</ButtonContainer>
			</form>
		</FormWrapper>
	);

	return (
		<>
			<SiteOwnerTransferActionPanelBody>
				<Notice status="is-info" showDismiss={ false }>
					{ translate(
						'Please read the following actions that will take place when you transfer this site'
					) }
				</Notice>
				<ContentAndOwnershipCard
					siteSlug={ selectedSiteSlug }
					siteOwner={ siteOwner }
					isAtomicSite={ isAtomicSite }
				/>
				<UpgradesCard
					purchases={ purchases }
					siteSlug={ selectedSiteSlug }
					siteOwner={ siteOwner }
				/>
				<DomainsCard
					domains={ customDomains }
					siteOwner={ siteOwner }
					siteSlug={ selectedSiteSlug }
				/>
				{ ! startSiteTransferSuccess && startSiteTransferForm }
			</SiteOwnerTransferActionPanelBody>
		</>
	);
};

export default connect( ( state: IAppState ) => ( {
	selectedSiteId: getSelectedSiteId( state ),
	selectedSiteSlug: getSelectedSiteSlug( state ),
	isAtomicSite: isSiteAutomatedTransfer( state, getSelectedSiteId( state ) ),
} ) )( localize( StartSiteOwnerTransfer ) );

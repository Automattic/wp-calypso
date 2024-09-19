import page from '@automattic/calypso-router';
import { Button, MaterialIcon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { MAP_EXISTING_DOMAIN } from '@automattic/urls';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import { stepsHeading } from 'calypso/components/domains/connect-domain-step/constants';
import {
	getAvailabilityErrorMessage,
	getDomainInboundTransferStatusInfo,
	getDomainTransferrability,
} from 'calypso/components/domains/use-my-domain/utilities';
import Notice from 'calypso/components/notice';
import { domainAvailability } from 'calypso/lib/domains/constants';
import wpcom from 'calypso/lib/wp';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import ConnectDomainStepWrapper from './connect-domain-step-wrapper';
import { Maybe, StartStepProps } from './types';

import './style.scss';

function TransferDomainStepStart( {
	className,
	pageSlug,
	onNextStep,
	progressStepList,
	domainInboundTransferStatusInfo,
	domain,
	isFetchingAvailability,
	selectedSite,
}: StartStepProps ) {
	const { __ } = useI18n();
	const switchToDomainConnect = () => page( localizeUrl( MAP_EXISTING_DOMAIN ) );
	const [ inboundTransferStatusInfo, setInboundTransferStatusInfo ] = useState<
		Maybe< typeof domainInboundTransferStatusInfo >
	>( domainInboundTransferStatusInfo );
	const [ isFetching, setIsFetching ] = useState( isFetchingAvailability );
	const isDomainTransferrable =
		getDomainTransferrability( inboundTransferStatusInfo ).transferrable;

	const initialValidation = useRef( false );

	// retrieves the availability data by itself if not provided by the parent component
	useEffect( () => {
		( async () => {
			if ( initialValidation.current ) {
				return;
			}
			if ( isFetching ) {
				return;
			}

			if ( ! inboundTransferStatusInfo ) {
				setIsFetching( true );

				try {
					const inboundTransferStatusResult = await getDomainInboundTransferStatusInfo( domain );

					setInboundTransferStatusInfo( inboundTransferStatusResult );
				} catch {
					setInboundTransferStatusInfo( {} );
				}
			}

			try {
				setIsFetching( true );

				const availabilityData = await wpcom.domain( domain ).isAvailable( {
					apiVersion: '1.3',
					is_cart_pre_check: false,
					blog_id: selectedSite?.ID,
				} );

				if ( domainAvailability.TRANSFER_PENDING_SAME_USER !== availabilityData.status ) {
					const availabilityErrorMessage = getAvailabilityErrorMessage( {
						availabilityData,
						domainName: domain,
						selectedSite,
					} );

					if ( availabilityErrorMessage ) {
						setInboundTransferStatusInfo( null );
					}
				}
			} catch {
				setInboundTransferStatusInfo( {} );
			} finally {
				initialValidation.current = true;
				setIsFetching( false );
			}
		} )();
	}, [ domain, inboundTransferStatusInfo, selectedSite, isFetching ] );

	const stepContent = (
		<>
			{ ! isFetching && ! isDomainTransferrable && (
				<Notice
					status="is-error"
					showDismiss={ false }
					text={ sprintf(
						/* translators: %s: the domain name that is being transferred (ex.: example.com) */
						__( 'The domain %s is not transferable.' ),
						domain
					) }
				></Notice>
			) }
			<div className={ className + '__transfer-start' }>
				<p className={ className + '__text' }>
					{ __(
						'For this setup you will need to log in to your current domain provider and go through a few steps.'
					) }
				</p>
				<CardHeading tagName="h2" className={ className + '__sub-heading' }>
					<MaterialIcon className={ className + '__sub-heading-icon' } size={ 24 } icon="timer" />
					{ __( 'How long will it take?' ) }
				</CardHeading>
				<p className={ className + '__text' }>
					{ __( 'It takes 10-20 minutes to set up.' ) }
					<br />
					{ __(
						'It can take up to 5 days for the domain to be transferred, depending on your provider.'
					) }
				</p>
				<p className={ className + '__text' }>
					{ createInterpolateElement(
						__(
							'If you would like to have your domain point to your WordPress.com site faster, consider <a>connecting your domain</a> first.'
						),
						{
							a: createElement( 'a', {
								className: 'connect-domain-step__change_mode_link',
								onClick: switchToDomainConnect,
							} ),
						}
					) }
				</p>
				<Button
					primary
					onClick={ onNextStep }
					disabled={ isFetching || ! isDomainTransferrable }
					busy={ isFetching }
				>
					{ __( 'Start setup' ) }
				</Button>
			</div>
		</>
	);

	return (
		<ConnectDomainStepWrapper
			className={ className }
			heading={ stepsHeading.TRANSFER }
			progressStepList={ progressStepList }
			pageSlug={ pageSlug }
			stepContent={ stepContent }
		/>
	);
}

export default connect( ( state ) => ( { selectedSite: getSelectedSite( state ) } ) )(
	TransferDomainStepStart
);

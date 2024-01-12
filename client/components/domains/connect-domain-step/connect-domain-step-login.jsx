import { Button } from '@automattic/components';
import { useLocalizeUrl } from '@automattic/i18n-utils';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import PropTypes from 'prop-types';
import { useEffect, useState, useRef } from 'react';
import Notice from 'calypso/components/notice';
import { domainAvailability } from 'calypso/lib/domains/constants';
import wpcom from 'calypso/lib/wp';
import ConnectDomainStepWrapper from './connect-domain-step-wrapper';
import { modeType, stepsHeading, stepSlug } from './constants';

import './style.scss';

export default function ConnectDomainStepLogin( {
	className,
	pageSlug,
	domain,
	isOwnershipVerificationFlow,
	mode,
	onNextStep,
	progressStepList,
} ) {
	const { __ } = useI18n();
	const [ heading, setHeading ] = useState();
	const [ isFetching, setIsFetching ] = useState( false );
	const [ isConnectSupported, setIsConnectSupported ] = useState( true );
	const [ rootDomainProvider, setRootDomainProvider ] = useState( 'unknown' );

	const initialValidation = useRef( false );
	const localizeUrl = useLocalizeUrl();

	useEffect( () => {
		switch ( mode ) {
			case modeType.TRANSFER:
				setHeading( stepsHeading.TRANSFER );
				return;
			case modeType.SUGGESTED:
				setHeading( stepsHeading.SUGGESTED );
				return;
			case modeType.ADVANCED:
				setHeading( stepsHeading.ADVANCED );
				return;
			case modeType.OWNERSHIP_VERIFICATION:
				setHeading( stepsHeading.OWNERSHIP_VERIFICATION );
				return;
		}
	}, [ mode ] );

	useEffect( () => {
		( async () => {
			if ( ! isOwnershipVerificationFlow || initialValidation.current ) {
				return;
			}

			setIsFetching( true );

			try {
				const availability = await wpcom
					.domain( domain )
					.isAvailable( { apiVersion: '1.3', is_cart_pre_check: false } );

				if ( domainAvailability.MAPPABLE !== availability.mappable ) {
					setIsConnectSupported( false );
				}
				setRootDomainProvider( availability.root_domain_provider );
			} catch {
				setIsConnectSupported( false );
			} finally {
				setIsFetching( false );
				initialValidation.current = true;
			}
		} )();
	} );

	const supportUrl = localizeUrl( 'https://wordpress.com/support/domains/connect-subdomain' );

	const stepContent = (
		<div className={ className + '__login' }>
			{ isOwnershipVerificationFlow && (
				<p className={ className + '__text' }>
					{ __( 'We need to confirm that you are authorized to connect this domain.' ) }
				</p>
			) }
			{ ! isFetching && ! isConnectSupported && (
				<Notice
					status="is-error"
					showDismiss={ false }
					text={ __( 'This domain cannot be connected.' ) }
				></Notice>
			) }
			{ ! isFetching && (
				<>
					{ rootDomainProvider === 'wpcom' && (
						<p className={ className + '__text' }>
							{ createInterpolateElement(
								__(
									"Open a new browser tab, switch to the site the domain is added to and go to <em>Upgrades → Domains</em>. Then click on the domain name to access the domain's settings page (alternatively click on the 3 vertical dots on the domain row and select <em>View Settings</em>).<br/><br/> If the domain is under another WordPress.com account, use a different browser, log in to that account and follow the previous instructions. <a>More info can be found here</a>."
								),
								{
									br: createElement( 'br' ),
									em: createElement( 'em' ),
									a: createElement( 'a', { href: supportUrl, target: '_blank' } ),
								}
							) }
						</p>
					) }
					{ rootDomainProvider !== 'wpcom' && (
						<>
							<p className={ className + '__text' }>
								{ createInterpolateElement(
									__(
										'Log into your domain provider account (like GoDaddy, NameCheap, 1&1, etc.). If you can’t remember who this is: go to <a>this link</a>, enter your domain and look at <em>Reseller Information</em> or <em>Registrar</em> to see the name of your provider.'
									),
									{
										em: createElement( 'em' ),
										a: createElement( 'a', {
											href: localizeUrl( 'https://wordpress.com/site-profiler' ),
											target: '_blank',
										} ),
									}
								) }
							</p>
							<p className={ className + '__text' }>
								{ sprintf(
									/* translators: %s: the domain name that the user is connecting to WordPress.com (ex.: example.com) */
									__(
										'On your domain provider’s site go to the domains page. Find %s and go to its settings page.'
									),
									domain
								) }
							</p>
						</>
					) }
				</>
			) }

			<Button
				primary
				onClick={ onNextStep }
				busy={ isFetching }
				disabled={ isFetching || ! isConnectSupported }
			>
				{ __( "I found the domain's settings page" ) }
			</Button>
		</div>
	);

	return (
		<ConnectDomainStepWrapper
			className={ className }
			heading={ heading }
			mode={ mode }
			progressStepList={ progressStepList }
			pageSlug={ pageSlug }
			stepContent={ stepContent }
		/>
	);
}

ConnectDomainStepLogin.propTypes = {
	className: PropTypes.string.isRequired,
	pageSlug: PropTypes.oneOf( Object.values( stepSlug ) ).isRequired,
	domain: PropTypes.string.isRequired,
	isOwnershipVerificationFlow: PropTypes.bool,
	mode: PropTypes.oneOf( Object.values( modeType ) ).isRequired,
	onNextStep: PropTypes.func.isRequired,
	progressStepList: PropTypes.object.isRequired,
};

ConnectDomainStepLogin.defaultProps = {
	isOwnershipVerificationFlow: false,
};

import { SiteDomain } from '@automattic/api-core';
import { useRouter } from '@tanstack/react-router';
import {
	__experimentalHStack as HStack,
	__experimentalItem as Item,
	__experimentalItemGroup as ItemGroup,
	__experimentalVStack as VStack,
	FlexBlock,
	SearchControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { arrowLeft, chevronRight, Icon } from '@wordpress/icons';
import { useMemo, useState } from 'react';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import { Text } from '../../components/text';
import { hasGSuiteWithUs, hasTitanMailWithUs } from '../../utils/domain';
import AddNewDomain from '../components/add-new-domain';
import { useDomains } from '../hooks/use-domains';

import './styles.css';

export default function ChooseDomain() {
	const router = useRouter();
	const { domains, isLoading } = useDomains();

	// Aggregate eligible domains (exclude wpcom domains)
	const eligibleDomains = useMemo( () => {
		return ( domains ?? [] ).filter( ( domain ) => ! domain.wpcom_domain );
	}, [ domains ] );

	// Prepare domain lists and search state
	const firstTen = eligibleDomains.slice( 0, 10 );
	const remaining = eligibleDomains.slice( 10 );
	const [ search, setSearch ] = useState( '' );
	const filteredRemaining = useMemo( () => {
		const q = search.trim().toLowerCase();
		if ( ! q ) {
			return [] as SiteDomain[];
		}
		return eligibleDomains.filter( ( d ) => d.domain.toLowerCase().includes( q ) );
	}, [ eligibleDomains, search ] );

	const handleDomainClick = ( d: SiteDomain ) => {
		// Navigate based on existing email solution
		if ( hasTitanMailWithUs( d ) ) {
			router.navigate( { to: '/emails/add-titan-mailbox' } );
			return;
		}
		if ( hasGSuiteWithUs( d ) ) {
			router.navigate( { to: '/emails/add-google-mailbox' } );
			return;
		}
		router.navigate( {
			to: `/emails/choose-email-solution/${ encodeURIComponent( d.domain ) }`,
		} );
	};

	return (
		<PageLayout
			header={
				<PageHeader
					prefix={
						<RouterLinkButton
							className="add-forwarder__back-button"
							icon={ arrowLeft }
							iconSize={ 12 }
							to="/emails"
						>
							<Text variant="muted">{ __( 'Emails' ) }</Text>
						</RouterLinkButton>
					}
				/>
			}
			size="small"
		>
			<Text size={ 16 }>{ __( 'Which domain name would you like to add a mailbox for?' ) }</Text>
			<VStack spacing={ 6 }>
				{ isLoading ? (
					<Text variant="muted">{ __( 'Loading domains…' ) }</Text>
				) : (
					<>
						<ItemGroup className="choose-domain__itemlist" isBordered isSeparated>
							{ remaining.length > 0 && (
								<Item>
									<SearchControl
										className="searchbox"
										value={ search }
										onChange={ setSearch }
										placeholder={ __( 'Search' ) }
									/>
								</Item>
							) }
							{ ! search.trim() &&
								firstTen.map( ( d ) => (
									<Item key={ d.blog_id + '-' + d.domain } onClick={ () => handleDomainClick( d ) }>
										<HStack justify="flex-start">
											<FlexBlock>{ d.domain }</FlexBlock>
											<Icon className="choose-domain__icon" icon={ chevronRight } />
										</HStack>
									</Item>
								) ) }
							{ remaining.length > 0 &&
								search.trim() &&
								filteredRemaining.map( ( d: SiteDomain ) => (
									<Item key={ d.blog_id + '-' + d.domain } onClick={ () => handleDomainClick( d ) }>
										<HStack justify="flex-start">
											<FlexBlock>{ d.domain }</FlexBlock>
											<Icon className="choose-domain__icon" icon={ chevronRight } />
										</HStack>
									</Item>
								) ) }
						</ItemGroup>
						<AddNewDomain />
					</>
				) }
			</VStack>
		</PageLayout>
	);
}

import { Domain, DomainSubtype, DomainSummary } from '@automattic/api-core';
import { domainsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
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
import { chevronRight, Icon } from '@wordpress/icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { chooseEmailSolutionRoute } from '../../app/router/emails';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { Text } from '../../components/text';
import AddNewDomain from '../components/add-new-domain';
import { BackToEmailsPrefix } from '../components/back-to-emails-prefix';

import './styles.css';

export default function ChooseDomain() {
	const router = useRouter();

	const { data: allDomains, isLoading: isLoading } = useQuery( domainsQuery() );
	const eligibleDomains = ( allDomains ?? [] ).filter(
		( d ) => d.current_user_is_owner && d.subtype.id !== DomainSubtype.DEFAULT_ADDRESS
	);

	const { recordTracksEvent } = useAnalytics();
	const searchRef = useRef< HTMLInputElement >( null );

	useEffect( () => {
		searchRef.current?.focus();
	}, [] );

	// Prepare domain lists and search state
	const firstTen = eligibleDomains.slice( 0, 10 );
	const remaining = eligibleDomains.slice( 10 );
	const [ search, setSearch ] = useState( '' );
	const filteredRemaining = useMemo( () => {
		const q = search.trim().toLowerCase();
		if ( ! q ) {
			return [] as Domain[];
		}
		return eligibleDomains.filter( ( d ) => d.domain.toLowerCase().includes( q ) );
	}, [ eligibleDomains, search ] );

	const handleDomainClick = ( d: DomainSummary ) => {
		recordTracksEvent( 'calypso_dashboard_emails_choose_domain_domain_click', {
			domain: d.domain,
		} );

		router.navigate( {
			to: chooseEmailSolutionRoute.to,
			params: { domain: d.domain },
		} );
	};

	return (
		<PageLayout header={ <PageHeader prefix={ <BackToEmailsPrefix /> } /> } size="small">
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
										__nextHasNoMarginBottom
										className="searchbox"
										value={ search }
										onChange={ setSearch }
										placeholder={ __( 'Search' ) }
										ref={ searchRef }
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
								filteredRemaining.map( ( d: DomainSummary ) => (
									<Item key={ d.blog_id + '-' + d.domain } onClick={ () => handleDomainClick( d ) }>
										<HStack justify="flex-start">
											<FlexBlock>{ d.domain }</FlexBlock>
											<Icon className="choose-domain__icon" icon={ chevronRight } />
										</HStack>
									</Item>
								) ) }
						</ItemGroup>
						<AddNewDomain origin="choose-domain" />
					</>
				) }
			</VStack>
		</PageLayout>
	);
}
